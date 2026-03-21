import { getSelectedGuest, isAiDisabled, freezeGuest, unfreezeGuest } from "./guest";

var actionQueue = [];
var currentAction = null;
var tickInterval = null;
var moveTickCount = 0;
var lastMoveDist = -1;

function addAction(action) {
    actionQueue.push(action);
}

function removeAction(index) {
    actionQueue.splice(index, 1);
}

function clearActions() {
    actionQueue = [];
    currentAction = null;
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
    clearHighlight();

    // If nothing left to do and AI is disabled, freeze
    if (actionQueue.length === 0 && isAiDisabled()) {
        freezeGuest();
    }
}

function executeTick() {
    var guest = getSelectedGuest();
    if (!guest) return;

    // --- Waiting for current action to complete ---
    if (currentAction !== null) {
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

    // Unfreeze so the guest can walk
    unfreezeGuest();
    guest.destination = {
        x: currentAction.target.x * 32 + 16,
        y: currentAction.target.y * 32 + 16
    };
    highlightTarget(currentAction.target);
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
    clearHighlight
};
