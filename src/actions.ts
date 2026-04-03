import { PeepSimModel, QueuedAction, ACTION_LABELS, GuestState } from "./model";
import { guestStates, ensureGuestState, removeGuestState, markProjectionDirty, projectToUI } from "./state";
import {
    getSelectedGuest, getGuestById, freezeGuest, unfreezeGuest,
    freezeGuestEntity, unfreezeGuestEntity,
    releaseDirectGuest, selectGuest, refreshGuestList
} from "./guest";

// ── Queue manipulation ─────────────────────────────────────────────────

export function addAction(model: PeepSimModel, action: QueuedAction): void {
    const id = model.selectedGuestId.get();
    if (id === null) return;
    var gs = guestStates[id];
    if (!gs) return;
    gs.actionQueue = gs.actionQueue.slice();
    gs.actionQueue.push(action);
    projectToUI(model);
}

export function removeAction(model: PeepSimModel, index: number): void {
    const id = model.selectedGuestId.get();
    if (id === null) return;
    var gs = guestStates[id];
    if (!gs) return;

    gs.actionQueue = gs.actionQueue.slice();
    gs.actionQueue.splice(index, 1);

    // Adjust executing index if needed
    if (gs.queueExecutingIndex >= 0) {
        if (index < gs.queueExecutingIndex) {
            gs.queueExecutingIndex--;
        } else if (index === gs.queueExecutingIndex) {
            gs.queueExecutingIndex = -1;
            gs.currentAction = null;
        }
    }
    projectToUI(model);
}

export function clearActions(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    if (id !== null && guestStates[id]) {
        var gs = guestStates[id];
        gs.actionQueue = [];
        gs.currentAction = null;
        gs.actionTickCount = 0;
        gs.queueExecutingIndex = -1;
    }
    model.queueSelectedCell.set(null);
    projectToUI(model);
}

// ── Queue play/pause ───────────────────────────────────────────────────

export function pauseQueue(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    if (id !== null && guestStates[id]) {
        guestStates[id].queuePaused = true;
    }
    projectToUI(model);
    freezeGuest(model);
}

export function resumeQueue(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    var gs = (id !== null) ? guestStates[id] : undefined;
    if (gs) {
        gs.queuePaused = false;
    }
    projectToUI(model);

    const guest = getSelectedGuest(model);
    if (!guest) return;

    // Re-initiate the current action on the entity
    var current = gs ? gs.currentAction : null;
    if (current && current.type === "move" && current.target) {
        unfreezeGuest(model);
        guest.destination = {
            x: current.target.x * 32 + 16,
            y: current.target.y * 32 + 16
        };
    } else if (current && current.type === "action") {
        freezeGuest(model);
        guest.animation = current.animation! as GuestAnimation;
    }
}

// ── Direct control ─────────────────────────────────────────────────────

export function directMove(model: PeepSimModel, tileX: number, tileY: number): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    unfreezeGuest(model);
    guest.destination = {
        x: tileX * 32 + 16,
        y: tileY * 32 + 16
    };
}

export function directWalk(model: PeepSimModel, direction: number): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    if (guest.getFlag("positionFrozen")) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }

    const rotation = ui.mainViewport.rotation;
    const adjusted = (direction - rotation + 4) & 3;

    let dx = 0, dy = 0;
    if (adjusted === 0) { dx = -2; }
    else if (adjusted === 1) { dy = 2; }
    else if (adjusted === 2) { dx = 2; }
    else if (adjusted === 3) { dy = -2; }

    guest.destination = {
        x: guest.x + dx * 32,
        y: guest.y + dy * 32
    };
}

// ── Global Executor ────────────────────────────────────────────────────

var globalTickInterval: number | null = null;

export function startGlobalExecutor(): void {
    if (globalTickInterval !== null) return;
    globalTickInterval = context.setInterval(() => {
        globalExecuteTick();
    }, 100);
}

export function stopGlobalExecutor(): void {
    if (globalTickInterval !== null) {
        context.clearInterval(globalTickInterval);
        globalTickInterval = null;
    }
}

function finishGuestAction(gs: GuestState, guest: Guest): void {
    gs.currentAction = null;
    gs.moveTickCount = 0;
    gs.lastMoveDist = -1;
    gs.actionTickCount = 0;

    if (gs.keepSteps) {
        var nextIdx = gs.queueExecutingIndex + 1;
        if (nextIdx >= gs.actionQueue.length) {
            if (gs.loopQueue && gs.actionQueue.length > 0) {
                gs.queueExecutingIndex = -1; // will be picked up next tick
            } else {
                freezeGuestEntity(guest);
                gs.queuePaused = true;
                gs.queueExecutingIndex = -1;
            }
        }
    } else {
        if (gs.actionQueue.length === 0) {
            freezeGuestEntity(guest);
            gs.queuePaused = true;
            gs.queueExecutingIndex = -1;
        }
    }
}

function executeGuestTick(id: number, gs: GuestState): void {
    var entity = map.getEntity(id);
    if (!entity || entity.type !== "guest") return;
    var guest = entity as Guest;

    var current = gs.currentAction;
    if (current !== null) {
        if (current.type === "action") {
            gs.actionTickCount++;
            var durationTicks = (current.duration || 3) * 10;
            if (gs.actionTickCount >= durationTicks) {
                finishGuestAction(gs, guest);
            }
            return;
        }

        if (current.target) {
            var targetX = current.target.x * 32 + 16;
            var targetY = current.target.y * 32 + 16;
            var dx = guest.x - targetX;
            var dy = guest.y - targetY;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 32) {
                finishGuestAction(gs, guest);
                return;
            }

            gs.moveTickCount++;
            if (gs.moveTickCount % 10 === 0) {
                if (gs.lastMoveDist >= 0 && Math.abs(dist - gs.lastMoveDist) < 4) {
                    guest.destination = { x: targetX, y: targetY };
                }
                gs.lastMoveDist = dist;
            }
        }
        return;
    }

    // Pick next action
    if (gs.actionQueue.length === 0) {
        freezeGuestEntity(guest);
        gs.queuePaused = true;
        gs.queueExecutingIndex = -1;
        return;
    }

    var nextIdx: number;
    var next: QueuedAction;

    if (gs.keepSteps) {
        nextIdx = gs.queueExecutingIndex + 1;
        if (nextIdx >= gs.actionQueue.length) {
            if (gs.loopQueue) {
                nextIdx = 0;
            } else {
                freezeGuestEntity(guest);
                gs.queuePaused = true;
                gs.queueExecutingIndex = -1;
                return;
            }
        }
        next = gs.actionQueue[nextIdx];
        gs.queueExecutingIndex = nextIdx;
    } else {
        next = gs.actionQueue[0];
        gs.actionQueue = gs.actionQueue.slice(1);
        nextIdx = 0;
        gs.queueExecutingIndex = 0;
    }

    gs.currentAction = next;
    gs.moveTickCount = 0;
    gs.lastMoveDist = -1;
    gs.actionTickCount = 0;

    if (next.type === "action") {
        freezeGuestEntity(guest);
        guest.animation = next.animation! as GuestAnimation;
        guest.animationOffset = 0;
    } else if (next.target) {
        unfreezeGuestEntity(guest);
        guest.destination = {
            x: next.target.x * 32 + 16,
            y: next.target.y * 32 + 16
        };
    }
}

function globalExecuteTick(): void {
    var ids = Object.keys(guestStates);
    for (var i = 0; i < ids.length; i++) {
        var id = parseInt(ids[i], 10);
        if (isNaN(id)) continue;
        var gs = guestStates[id];
        if (!gs) continue;
        if (gs.mode !== "queued") continue;
        if (gs.queuePaused) continue;
        executeGuestTick(id, gs);
    }

    // Signal that state may have changed (picked up by projectIfDirty in onUpdate)
    markProjectionDirty();
}

// ── Direction walking ──────────────────────────────────────────────────

export function startDirectionWalk(model: PeepSimModel, direction: number): void {
    if (!getSelectedGuest(model)) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }

    const current = model.heldDirection.get();
    if (current === direction) {
        stopDirectionWalk(model);
        freezeGuest(model);
        return;
    }

    if (model.directionInterval !== null) {
        context.clearInterval(model.directionInterval);
        model.directionInterval = null;
    }

    model.heldDirection.set(direction);
    directWalk(model, direction);

    model.directionInterval = context.setInterval(() => {
        if (model.heldDirection.get() < 0) return;
        directWalk(model, model.heldDirection.get());
    }, 400);
}

export function stopDirectionWalk(model: PeepSimModel): boolean {
    const wasActive = model.heldDirection.get() >= 0;
    model.heldDirection.set(-1);
    if (model.directionInterval !== null) {
        context.clearInterval(model.directionInterval);
        model.directionInterval = null;
    }
    return wasActive;
}

// ── Move tool ──────────────────────────────────────────────────────────

export function activateMoveTool(model: PeepSimModel): void {
    if (!getSelectedGuest(model)) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }
    stopDirectionWalk(model);
    model.pickerActive.set(false);
    model.moveToolActive.set(true);
    ui.activateTool({
        id: "peepsim-move",
        cursor: "walk_down",
        filter: ["terrain"],
        onDown: (e: ToolEventArgs) => {
            if (e.mapCoords) {
                const tileX = Math.floor(e.mapCoords.x / 32);
                const tileY = Math.floor(e.mapCoords.y / 32);
                const mode = model.selectedMode.get();
                if (mode === 1) {
                    directMove(model, tileX, tileY);
                } else if (mode === 2) {
                    addAction(model, { type: "move", target: { x: tileX, y: tileY } });
                }
            }
        },
        onFinish: () => {
            model.moveToolActive.set(false);
        }
    });
}

export function deactivateMoveTool(model: PeepSimModel): void {
    if (ui.tool && ui.tool.id === "peepsim-move") {
        ui.tool.cancel();
    }
    model.moveToolActive.set(false);
}

// ── Picker tool ────────────────────────────────────────────────────────

export function activatePickerTool(model: PeepSimModel): void {
    model.moveToolActive.set(false);
    model.pickerActive.set(true);
    ui.activateTool({
        id: "peepsim-picker",
        cursor: "cross_hair",
        filter: ["entity"],
        onDown: (e: ToolEventArgs) => {
            if (e.entityId === undefined) return;
            const entity = map.getEntity(e.entityId);
            if (!entity || entity.type !== "guest") return;

            // Release direct-mode guest before switching
            releaseDirectGuest(model);
            stopDirectionWalk(model);
            deactivateMoveTool(model);

            // Ensure the picked guest has a state entry, then select
            ensureGuestState(e.entityId);
            selectGuest(model, e.entityId);
            refreshGuestList(model);
        },
        onFinish: () => {
            model.pickerActive.set(false);
        }
    });
}

export function deactivatePickerTool(model: PeepSimModel): void {
    if (ui.tool && ui.tool.id === "peepsim-picker") {
        ui.tool.cancel();
    }
    model.pickerActive.set(false);
}

// ── Perform single action ──────────────────────────────────────────────

export function performSelectedAction(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;
    const anims = model.actionAnimations.get();
    if (anims.length === 0) return;
    if (!guest.getFlag("positionFrozen")) return;

    const idx = model.selectedActionIndex.get();
    if (idx < 0 || idx >= anims.length) return;
    const anim = anims[idx];

    if (model.actionPlayInterval !== null) {
        context.clearInterval(model.actionPlayInterval);
        model.actionPlayInterval = null;
    }

    guest.animation = anim as GuestAnimation;
    guest.animationOffset = 0;

    let prevOffset = -1;
    model.actionPlayInterval = context.setInterval(() => {
        const g = getSelectedGuest(model);
        if (!g || g.animation !== anim) {
            if (model.actionPlayInterval !== null) {
                context.clearInterval(model.actionPlayInterval);
                model.actionPlayInterval = null;
            }
            return;
        }
        const offset = g.animationOffset;
        if (prevOffset >= 0 && offset < prevOffset) {
            g.animation = "watchRide";
            g.animationOffset = 0;
            if (model.actionPlayInterval !== null) {
                context.clearInterval(model.actionPlayInterval);
                model.actionPlayInterval = null;
            }
        }
        prevOffset = offset;
    }, 50);
}

// ── Mode transitions ───────────────────────────────────────────────────

export function handleModeChange(model: PeepSimModel, newModeIndex: number): void {
    const oldModeIndex = model.selectedMode.get();
    if (oldModeIndex === newModeIndex) return;

    // Clean up old mode
    if (oldModeIndex === 1) {
        // Leaving direct mode
        stopDirectionWalk(model);
        deactivateMoveTool(model);
    } else if (oldModeIndex === 2) {
        // Leaving queued mode
        pauseQueue(model);
        deactivateMoveTool(model);
    }

    const id = model.selectedGuestId.get();

    // Enter new mode
    if (newModeIndex === 0) {
        // Uncontrolled: dispose all state, let AI take over
        unfreezeGuest(model);
        if (id !== null) {
            clearActions(model);
            removeGuestState(id);
        }
    } else if (newModeIndex === 1) {
        // Direct: activate idle state
        freezeGuest(model);
        if (id !== null) {
            var gs = ensureGuestState(id);
            gs.mode = "direct";
        }
    } else if (newModeIndex === 2) {
        // Queued: activate paused queue state
        freezeGuest(model);
        if (id !== null) {
            var gs = ensureGuestState(id);
            gs.mode = "queued";
            gs.queuePaused = true;
        }
    }

    projectToUI(model);
    refreshGuestList(model);
}
