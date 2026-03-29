import { PeepSimModel, QueuedAction, ACTION_LABELS, GuestState, guestStates } from "./model";
import {
    getSelectedGuest, getGuestById, freezeGuest, unfreezeGuest,
    freezeGuestEntity, unfreezeGuestEntity,
    saveCurrentGuestState, selectGuest, loadGuestState, refreshGuestList,
    ensureGuestState
} from "./guest";

// ── Queue manipulation ─────────────────────────────────────────────────

export function addAction(model: PeepSimModel, action: QueuedAction): void {
    const queue = model.actionQueue.get().slice();
    queue.push(action);
    model.actionQueue.set(queue);
    // Sync to global state
    const id = model.selectedGuestId.get();
    if (id !== null && guestStates[id]) {
        guestStates[id].actionQueue = queue.slice();
    }
    refreshQueueList(model);
}

export function removeAction(model: PeepSimModel, index: number): void {
    const queue = model.actionQueue.get().slice();
    queue.splice(index, 1);
    model.actionQueue.set(queue);

    // Adjust executing index if needed
    const execIdx = model.queueExecutingIndex.get();
    if (execIdx >= 0) {
        if (index < execIdx) {
            model.queueExecutingIndex.set(execIdx - 1);
        } else if (index === execIdx) {
            model.queueExecutingIndex.set(-1);
            model.currentAction = null;
        }
    }
    // Sync to global state
    const id = model.selectedGuestId.get();
    if (id !== null && guestStates[id]) {
        guestStates[id].actionQueue = queue.slice();
        guestStates[id].queueExecutingIndex = model.queueExecutingIndex.get();
        guestStates[id].currentAction = model.currentAction;
    }
    refreshQueueList(model);
}

export function clearActions(model: PeepSimModel): void {
    model.actionQueue.set([]);
    model.currentAction = null;
    model.actionTickCount = 0;
    model.queueExecutingIndex.set(-1);
    model.queueSelectedCell.set(null);
    // Sync to global state
    const id = model.selectedGuestId.get();
    if (id !== null && guestStates[id]) {
        guestStates[id].actionQueue = [];
        guestStates[id].currentAction = null;
        guestStates[id].actionTickCount = 0;
        guestStates[id].queueExecutingIndex = -1;
    }
    refreshQueueList(model);
}

export function refreshQueueList(model: PeepSimModel): void {
    const actions = model.actionQueue.get();
    const execIdx = model.queueExecutingIndex.get();
    const paused = model.queuePaused.get();
    const items: string[][] = actions.map((a, i) => {
        let desc: string;
        if (a.type === "action") {
            const label = ACTION_LABELS[a.animation!] || a.animation!;
            desc = `${label} (${a.duration || 3}s)`;
        } else {
            desc = `Move \u2192 ${a.target!.x}, ${a.target!.y}`;
        }
        var status = "";
        if (i === execIdx) {
            status = paused ? "||" : "\u25B6";
        }
        return [status, String(i + 1), desc];
    });
    model.queueListItems.set(items);
}

// ── Queue play/pause ───────────────────────────────────────────────────

export function pauseQueue(model: PeepSimModel): void {
    model.queuePaused.set(true);
    const id = model.selectedGuestId.get();
    if (id !== null && guestStates[id]) {
        guestStates[id].queuePaused = true;
    }
    freezeGuest(model);
}

export function resumeQueue(model: PeepSimModel): void {
    model.queuePaused.set(false);
    const id = model.selectedGuestId.get();
    var gs = (id !== null) ? guestStates[id] : undefined;
    if (gs) {
        gs.queuePaused = false;
    }

    const guest = getSelectedGuest(model);
    if (!guest) return;

    // Re-initiate the current action on the entity
    var current = gs ? gs.currentAction : model.currentAction;
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

    model.actionQueue.set([]);
    model.currentAction = { type: "move", target: { x: tileX, y: tileY } };
    model.moveTickCount = 0;
    model.lastMoveDist = -1;

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

    model.actionQueue.set([]);
    model.currentAction = null;
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

var uiModel: PeepSimModel | null = null;

/** Register the UI model so the executor can sync state directly to stores. */
export function setUIModel(model: PeepSimModel | null): void {
    uiModel = model;
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

    // Sync selected guest's state → UI stores (atomic, same call frame)
    if (uiModel !== null) {
        var selId = uiModel.selectedGuestId.get();
        if (selId !== null) {
            var selGs = guestStates[selId];
            if (selGs && selGs.mode === "queued") {
                syncGuestToUI(uiModel, selGs);
            }
        }
    }
}

/** One-way sync: guestStates → UI stores. Only sets stores when values differ. */
function syncGuestToUI(model: PeepSimModel, gs: GuestState): void {
    var changed = false;
    model.isRefreshing = true;

    if (model.queuePaused.get() !== gs.queuePaused) {
        model.queuePaused.set(gs.queuePaused);
        changed = true;
    }
    if (model.queueExecutingIndex.get() !== gs.queueExecutingIndex) {
        model.queueExecutingIndex.set(gs.queueExecutingIndex);
        changed = true;
    }
    if (model.currentAction !== gs.currentAction) {
        model.currentAction = gs.currentAction;
        changed = true;
    }
    // Compare queue by length — executor either slices (shrinks) or leaves it
    var mq = model.actionQueue.get();
    if (mq.length !== gs.actionQueue.length) {
        model.actionQueue.set(gs.actionQueue.slice());
        changed = true;
    }

    if (changed) {
        refreshQueueList(model);
    }

    model.isRefreshing = false;
}

/** Sync global guestStates → UI model for the selected guest (call from onUpdate). */
export function syncFromGlobalState(model: PeepSimModel): void {
    var id = model.selectedGuestId.get();
    if (id === null) return;
    var gs = guestStates[id];
    if (!gs || gs.mode !== "queued") return;
    syncGuestToUI(model, gs);
}

/** Sync a single field from UI model → global guestStates for the selected guest. */
export function syncSettingToGlobal(model: PeepSimModel): void {
    var id = model.selectedGuestId.get();
    if (id === null) return;
    var gs = guestStates[id];
    if (!gs) return;
    gs.keepSteps = model.keepSteps.get();
    gs.loopQueue = model.loopQueue.get();
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

            // Save current guest state before switching
            saveCurrentGuestState(model);
            stopDirectionWalk(model);
            deactivateMoveTool(model);

            // Ensure the picked guest has a state entry
            ensureGuestState(model, e.entityId);

            // Select and load
            selectGuest(model, e.entityId);
            loadGuestState(model, e.entityId);
            refreshGuestList(model);
            refreshQueueList(model);
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

    model.isRefreshing = true;
    model.selectedMode.set(newModeIndex);
    model.isRefreshing = false;

    const id = model.selectedGuestId.get();

    // Enter new mode
    if (newModeIndex === 0) {
        // Uncontrolled — dispose all state, let AI take over
        unfreezeGuest(model);
        clearActions(model);
        model.heldDirection.set(-1);
        if (id !== null) {
            delete guestStates[id];
        }
    } else if (newModeIndex === 1) {
        // Direct — activate idle state
        freezeGuest(model);
        if (id !== null) {
            var gs = ensureGuestState(model, id);
            gs.mode = "direct";
        }
    } else if (newModeIndex === 2) {
        // Queued — activate paused queue state
        freezeGuest(model);
        model.queuePaused.set(true);
        if (id !== null) {
            var gs = ensureGuestState(model, id);
            gs.mode = "queued";
            gs.queuePaused = true;
        }
    }

    // Refresh guest list to update mode labels in dropdown
    refreshGuestList(model);
}
