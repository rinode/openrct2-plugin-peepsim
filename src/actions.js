import { getSelectedGuest, isAiDisabled, freezeGuest, unfreezeGuest } from "./guest";

var actionQueue = [];
var currentAction = null;
var tickInterval = null;
var moveTickCount = 0;
var lastMoveDist = -1;
var controlMode = "direct"; // "direct" or "queued"
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
    // Freeze guest if currently executing
    var guest = getSelectedGuest();
    if (guest && currentAction) {
        freezeGuest();
    }
}

function resumeQueue() {
    queuePaused = false;
    // Unfreeze if there's work to do
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

// Direct mode: immediately move to target, cancel any previous action
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

// Direct mode: move one tile in a direction (NE/SE/SW/NW)
// Directions are in map coords, adjusted for camera rotation
function directMoveDirection(direction) {
    var guest = getSelectedGuest();
    if (!guest) return;

    var tileX = Math.floor(guest.x / 32);
    var tileY = Math.floor(guest.y / 32);

    // direction 0=NE, 1=SE, 2=SW, 3=NW (in map space)
    // Adjust for camera rotation
    var rotation = ui.mainViewport.rotation;
    var adjusted = (direction + rotation) & 3;

    if (adjusted === 0) { tileX -= 1; tileY += 0; } // NE
    else if (adjusted === 1) { tileX += 0; tileY += 1; } // SE
    else if (adjusted === 2) { tileX += 1; tileY += 0; } // SW
    else if (adjusted === 3) { tileX += 0; tileY -= 1; } // NW

    directMove(tileX, tileY, true);
}

// Continuous directional walk — sets destination 2 tiles ahead without
// going through the executor freeze/unfreeze cycle. Used by the direction
// hold buttons for smooth, stutter-free movement.
function directWalk(direction) {
    var guest = getSelectedGuest();
    if (!guest) return;

    // Make sure guest is unfrozen and walking
    if (guest.getFlag("positionFrozen")) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }

    var rotation = ui.mainViewport.rotation;
    var adjusted = (direction + rotation) & 3;

    // Point 2 tiles ahead for smoother pathing
    var dx = 0, dy = 0;
    if (adjusted === 0) { dx = -2; } // NE
    else if (adjusted === 1) { dy = 2; } // SE
    else if (adjusted === 2) { dx = 2; } // SW
    else if (adjusted === 3) { dy = -2; } // NW

    guest.destination = {
        x: guest.x + dx * 32,
        y: guest.y + dy * 32
    };

    // Clear any executor state so it doesn't interfere
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

    // If nothing left to do and AI is disabled, freeze
    if (actionQueue.length === 0 && isAiDisabled()) {
        freezeGuest();
    }
}

function executeTick() {
    var guest = getSelectedGuest();
    if (!guest) return;

    // Don't process if paused
    if (queuePaused) return;

    // --- Waiting for current action to complete ---
    if (currentAction !== null) {
        if (currentAction.type === "action") {
            // Animation action: count ticks for duration
            actionTickCount++;
            // 10 ticks per second (100ms interval)
            var durationTicks = (currentAction.duration || 3) * 10;
            if (actionTickCount >= durationTicks) {
                finishCurrentAction();
            }
            return;
        }

        // Move action
        var targetX = currentAction.target.x * 32 + 16;
        var targetY = currentAction.target.y * 32 + 16;
        var dx = guest.x - targetX;
        var dy = guest.y - targetY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        // Close enough — done
        if (dist < 32) {
            finishCurrentAction();
            return;
        }

        moveTickCount++;

        // Every 10 ticks (~1s), check if guest is making progress
        if (moveTickCount % 10 === 0) {
            if (lastMoveDist >= 0 && Math.abs(dist - lastMoveDist) < 4) {
                // Guest is stuck, re-nudge destination
                guest.destination = { x: targetX, y: targetY };
            }
            lastMoveDist = dist;
        }
        return;
    }

    // --- No current action ---
    if (actionQueue.length === 0) return;

    // Pick up next action
    currentAction = actionQueue.shift();
    moveTickCount = 0;
    lastMoveDist = -1;
    actionTickCount = 0;

    if (currentAction.type === "action") {
        // Animation action: freeze in place and set animation
        freezeGuest();
        guest.animation = currentAction.animation;
        guest.animationOffset = 0;
    } else {
        // Move action: unfreeze so the guest can walk
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
