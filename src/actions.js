import { getSelectedGuest, isAiDisabled, freezeGuest, unfreezeGuest } from "./guest";

var actionQueue = [];
var currentAction = null;
var tickInterval = null;
var moveTickCount = 0;
var lastMoveDist = -1;
var controlMode = "direct";
var queuePaused = false;
var actionTickCount = 0;

function setControlMode(mode) {
    controlMode = mode;
}

function getControlMode() {
    return controlMode;
}

function addAction(action) {
    actionQueue.push(action);
}

function removeAction(index) {
    actionQueue.splice(index, 1);
}

function clearActions() {
    actionQueue = [];
    currentAction = null;
    actionTickCount = 0;
}

function getActions() {
    return actionQueue;
}

function getCurrentAction() {
    return currentAction;
}

function hasWork() {
    return currentAction !== null || actionQueue.length > 0;
}

function pauseQueue() {
    queuePaused = true;
    freezeGuest();
}

function resumeQueue() {
    queuePaused = false;
    if (hasWork()) {
        var guest = getSelectedGuest();
        if (guest && currentAction && currentAction.type === "move") {
            unfreezeGuest();
            guest.destination = {
                x: currentAction.target.x * 32 + 16,
                y: currentAction.target.y * 32 + 16
            };
        } else if (guest && currentAction && currentAction.type === "action") {
            freezeGuest();
            guest.animation = currentAction.animation;
        }
    }
}

function isQueuePaused() {
    return queuePaused;
}

function directMove(tileX, tileY, skipHighlight) {
    var guest = getSelectedGuest();
    if (!guest) return;

    actionQueue = [];
    currentAction = { target: { x: tileX, y: tileY } };
    moveTickCount = 0;
    lastMoveDist = -1;

    unfreezeGuest();
    guest.destination = {
        x: tileX * 32 + 16,
        y: tileY * 32 + 16
    };
    if (!skipHighlight) {
        highlightTarget(currentAction.target);
    } else {
        clearHighlight();
    }
}

function directMoveDirection(direction) {
    var guest = getSelectedGuest();
    if (!guest) return;

    var tileX = Math.floor(guest.x / 32);
    var tileY = Math.floor(guest.y / 32);

    var rotation = ui.mainViewport.rotation;
    var adjusted = (direction - rotation + 4) & 3;

    if (adjusted === 0) { tileX -= 1; }
    else if (adjusted === 1) { tileY += 1; }
    else if (adjusted === 2) { tileX += 1; }
    else if (adjusted === 3) { tileY -= 1; }

    directMove(tileX, tileY, true);
}

// Sets destination 2 tiles ahead for smooth stutter-free walking.
function directWalk(direction) {
    var guest = getSelectedGuest();
    if (!guest) return;

    if (guest.getFlag("positionFrozen")) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }

    var rotation = ui.mainViewport.rotation;
    var adjusted = (direction - rotation + 4) & 3;

    var dx = 0, dy = 0;
    if (adjusted === 0) { dx = -2; }
    else if (adjusted === 1) { dy = 2; }
    else if (adjusted === 2) { dx = 2; }
    else if (adjusted === 3) { dy = -2; }

    guest.destination = {
        x: guest.x + dx * 32,
        y: guest.y + dy * 32
    };

    actionQueue = [];
    currentAction = null;
    clearHighlight();
}

function startExecutor() {
    if (tickInterval !== null) return;
    tickInterval = context.setInterval(function () {
        executeTick();
    }, 100);
}

function stopExecutor() {
    if (tickInterval !== null) {
        context.clearInterval(tickInterval);
        tickInterval = null;
    }
}

function highlightTarget(target) {
    ui.tileSelection.tiles = [{ x: target.x * 32, y: target.y * 32 }];
}

function clearHighlight() {
    ui.tileSelection.tiles = [];
}

function finishCurrentAction() {
    currentAction = null;
    moveTickCount = 0;
    lastMoveDist = -1;
    actionTickCount = 0;
    clearHighlight();

    if (actionQueue.length === 0 && isAiDisabled()) {
        freezeGuest();
        queuePaused = true;
    }
}

function executeTick() {
    var guest = getSelectedGuest();
    if (!guest) return;

    if (queuePaused) return;

    if (currentAction !== null) {
        if (currentAction.type === "action") {
            actionTickCount++;
            var durationTicks = (currentAction.duration || 3) * 10;
            if (actionTickCount >= durationTicks) {
                finishCurrentAction();
            }
            return;
        }

        var targetX = currentAction.target.x * 32 + 16;
        var targetY = currentAction.target.y * 32 + 16;
        var dx = guest.x - targetX;
        var dy = guest.y - targetY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 32) {
            finishCurrentAction();
            return;
        }

        moveTickCount++;

        // Check every ~1s if guest is stuck, re-nudge if so
        if (moveTickCount % 10 === 0) {
            if (lastMoveDist >= 0 && Math.abs(dist - lastMoveDist) < 4) {
                guest.destination = { x: targetX, y: targetY };
            }
            lastMoveDist = dist;
        }
        return;
    }

    if (actionQueue.length === 0) return;

    currentAction = actionQueue.shift();
    moveTickCount = 0;
    lastMoveDist = -1;
    actionTickCount = 0;

    if (currentAction.type === "action") {
        freezeGuest();
        guest.animation = currentAction.animation;
        guest.animationOffset = 0;
    } else {
        unfreezeGuest();
        guest.destination = {
            x: currentAction.target.x * 32 + 16,
            y: currentAction.target.y * 32 + 16
        };
        highlightTarget(currentAction.target);
    }
}

export {
    addAction,
    removeAction,
    clearActions,
    getActions,
    getCurrentAction,
    hasWork,
    startExecutor,
    stopExecutor,
    clearHighlight,
    setControlMode,
    getControlMode,
    directMove,
    directMoveDirection,
    directWalk,
    pauseQueue,
    resumeQueue,
    isQueuePaused
};
