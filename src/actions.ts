import { PeepSimModel, QueuedAction, ACTION_LABELS, GuestState, GuestMode, ActionType } from "./model";
import { guestStates, ensureGuestState, removeGuestState } from "./state";
import { batch } from "./signal";
import {
    getSelectedGuest, getGuestById, freezeGuest, unfreezeGuest,
    freezeGuestEntity, unfreezeGuestEntity,
    releaseDirectGuest, selectGuest, refreshGuestList
} from "./guest";

// ── Queue manipulation ────────────────────────────────────────────────

export function addAction(model: PeepSimModel, action: QueuedAction): void {
    const id = model.selectedGuestId.get();
    if (id === null) return;
    const gs = guestStates.get(id);
    if (!gs) return;
    gs.actionQueue.set([...gs.actionQueue.get(), action]);
}

export function removeAction(model: PeepSimModel, index: number): void {
    const id = model.selectedGuestId.get();
    if (id === null) return;
    const gs = guestStates.get(id);
    if (!gs) return;

    const queue = gs.actionQueue.get().slice();
    queue.splice(index, 1);
    gs.actionQueue.set(queue);

    const execIdx = gs.queueExecutingIndex.get();
    if (execIdx >= 0) {
        if (index < execIdx) {
            gs.queueExecutingIndex.set(execIdx - 1);
        } else if (index === execIdx) {
            gs.queueExecutingIndex.set(-1);
            gs.currentAction = null;
        }
    }
}

export function clearActions(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    if (id !== null) {
        const gs = guestStates.get(id);
        if (gs) {
            batch(() => {
                gs.actionQueue.set([]);
                gs.queueExecutingIndex.set(-1);
            });
            gs.currentAction = null;
            gs.actionTickCount = 0;
        }
    }
    model.queueSelectedCell.set(null);
}

// ── Queue play/pause ──────────────────────────────────────────────────

export function pauseQueue(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    if (id !== null) {
        const gs = guestStates.get(id);
        if (gs) gs.queuePaused.set(true);
    }
    freezeGuest(model);
}

export function resumeQueue(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    const gs = id !== null ? guestStates.get(id) : undefined;
    if (gs) {
        gs.queuePaused.set(false);
    }

    const guest = getSelectedGuest(model);
    if (!guest) return;

    const current = gs?.currentAction ?? null;
    if (current?.type === ActionType.Move && current.target) {
        unfreezeGuest(model);
        guest.destination = {
            x: current.target.x * 32 + 16,
            y: current.target.y * 32 + 16,
        };
    } else if (current?.type === ActionType.Action) {
        freezeGuest(model);
        guest.animation = current.animation! as GuestAnimation;
    }
}

// ── Direct control ────────────────────────────────────────────────────

export function directMove(model: PeepSimModel, tileX: number, tileY: number): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    unfreezeGuest(model);
    guest.destination = {
        x: tileX * 32 + 16,
        y: tileY * 32 + 16,
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
    if (adjusted === 0) dx = -2;
    else if (adjusted === 1) dy = 2;
    else if (adjusted === 2) dx = 2;
    else if (adjusted === 3) dy = -2;

    guest.destination = {
        x: guest.x + dx * 32,
        y: guest.y + dy * 32,
    };
}

// ── Global Executor ───────────────────────────────────────────────────

let globalTickInterval: number | null = null;

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
    freezeGuestEntity(guest);
    gs.currentAction = null;
    gs.moveTickCount = 0;
    gs.lastMoveDist = -1;
    gs.actionTickCount = 0;

    const keepSteps = gs.keepSteps.get();
    const queue = gs.actionQueue.get();
    const execIdx = gs.queueExecutingIndex.get();

    if (keepSteps) {
        const nextIdx = execIdx + 1;
        if (nextIdx >= queue.length) {
            if (gs.loopQueue.get() && queue.length > 0) {
                gs.queueExecutingIndex.set(-1);
            } else {
                gs.queuePaused.set(true);
                gs.queueExecutingIndex.set(-1);
            }
        }
    } else {
        if (queue.length === 0) {
            gs.queuePaused.set(true);
            gs.queueExecutingIndex.set(-1);
        }
    }
}

function executeGuestTick(id: number, gs: GuestState): void {
    const entity = map.getEntity(id);
    if (!entity || entity.type !== "guest") return;
    const guest = entity as Guest;

    const current = gs.currentAction;
    if (current !== null) {
        if (current.type === ActionType.Action) {
            gs.actionTickCount++;
            const durationTicks = (current.duration ?? 3) * 10;
            if (gs.actionTickCount >= durationTicks) {
                finishGuestAction(gs, guest);
            }
            return;
        }

        if (current.target) {
            const targetX = current.target.x * 32 + 16;
            const targetY = current.target.y * 32 + 16;
            const dx = guest.x - targetX;
            const dy = guest.y - targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 8) {
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
    const queue = gs.actionQueue.get();
    if (queue.length === 0) {
        freezeGuestEntity(guest);
        gs.queuePaused.set(true);
        gs.queueExecutingIndex.set(-1);
        return;
    }

    let nextIdx: number;
    let next: QueuedAction;

    if (gs.keepSteps.get()) {
        nextIdx = gs.queueExecutingIndex.get() + 1;
        if (nextIdx >= queue.length) {
            if (gs.loopQueue.get()) {
                nextIdx = 0;
            } else {
                freezeGuestEntity(guest);
                gs.queuePaused.set(true);
                gs.queueExecutingIndex.set(-1);
                return;
            }
        }
        next = queue[nextIdx];
        gs.queueExecutingIndex.set(nextIdx);
    } else {
        next = queue[0];
        gs.actionQueue.set(queue.slice(1));
        nextIdx = 0;
        gs.queueExecutingIndex.set(0);
    }

    gs.currentAction = next;
    gs.moveTickCount = 0;
    gs.lastMoveDist = -1;
    gs.actionTickCount = 0;

    if (next.type === ActionType.Action) {
        freezeGuestEntity(guest);
        guest.animation = next.animation! as GuestAnimation;
        guest.animationOffset = 0;
    } else if (next.target) {
        unfreezeGuestEntity(guest);
        guest.destination = {
            x: next.target.x * 32 + 16,
            y: next.target.y * 32 + 16,
        };
    }
}

function globalExecuteTick(): void {
    batch(() => {
        for (const [id, gs] of guestStates) {
            if (gs.mode.get() !== GuestMode.Sequence) continue;
            if (gs.queuePaused.get()) continue;
            executeGuestTick(id, gs);
        }
    });
}

// ── Direction walking ─────────────────────────────────────────────────

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
    const id = model.selectedGuestId.get();
    if (id !== null) {
        guestStates.get(id)?.heldDirection.set(direction);
    }
    directWalk(model, direction);

    model.directionInterval = context.setInterval(() => {
        if (model.heldDirection.get() < 0) return;
        directWalk(model, model.heldDirection.get());
    }, 400);
}

export function stopDirectionWalk(model: PeepSimModel): boolean {
    const wasActive = model.heldDirection.get() >= 0;
    model.heldDirection.set(-1);
    const id = model.selectedGuestId.get();
    if (id !== null) {
        guestStates.get(id)?.heldDirection.set(-1);
    }
    if (model.directionInterval !== null) {
        context.clearInterval(model.directionInterval);
        model.directionInterval = null;
    }
    return wasActive;
}

// ── Move tool ─────────────────────────────────────────────────────────

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
        filter: ["footpath", "terrain"],
        onDown: (e: ToolEventArgs) => {
            if (e.mapCoords) {
                const tileX = Math.floor(e.mapCoords.x / 32);
                const tileY = Math.floor(e.mapCoords.y / 32);
                const mode = model.selectedMode.get();
                if (mode === 1) {
                    directMove(model, tileX, tileY);
                } else if (mode === 2) {
                    addAction(model, { type: ActionType.Move, target: { x: tileX, y: tileY } });
                    deactivateMoveTool(model);
                }
            }
        },
        onFinish: () => {
            model.moveToolActive.set(false);
        },
    });
}

export function deactivateMoveTool(model: PeepSimModel): void {
    if (ui.tool?.id === "peepsim-move") {
        ui.tool.cancel();
    }
    model.moveToolActive.set(false);
}

// ── Picker tool ───────────────────────────────────────────────────────

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

            releaseDirectGuest(model);
            stopDirectionWalk(model);
            deactivateMoveTool(model);

            ensureGuestState(e.entityId);
            selectGuest(model, e.entityId);
            refreshGuestList(model);
            deactivatePickerTool(model);
        },
        onFinish: () => {
            model.pickerActive.set(false);
        },
    });
}

export function deactivatePickerTool(model: PeepSimModel): void {
    if (ui.tool?.id === "peepsim-picker") {
        ui.tool.cancel();
    }
    model.pickerActive.set(false);
}

// ── Perform single action ─────────────────────────────────────────────

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

// ── Mode transitions ──────────────────────────────────────────────────

let changingMode = false;

export function handleModeChange(model: PeepSimModel, newModeIndex: number): void {
    if (changingMode) return;
    const oldModeIndex = model.selectedMode.get();
    if (oldModeIndex === newModeIndex) return;
    changingMode = true;

    // Clean up old mode
    if (oldModeIndex === 1) {
        stopDirectionWalk(model);
        deactivateMoveTool(model);
    } else if (oldModeIndex === 2) {
        pauseQueue(model);
        deactivateMoveTool(model);
    }

    const id = model.selectedGuestId.get();

    if (newModeIndex === 0) {
        unfreezeGuest(model);
        if (id !== null) {
            clearActions(model);
            removeGuestState(id);
        }
    } else if (newModeIndex === 1) {
        freezeGuest(model);
        if (id !== null) {
            const gs = ensureGuestState(id);
            gs.mode.set(GuestMode.Direct);
            model.bindToGuest(gs);
        }
    } else if (newModeIndex === 2) {
        freezeGuest(model);
        if (id !== null) {
            const gs = ensureGuestState(id);
            gs.mode.set(GuestMode.Sequence);
            gs.queuePaused.set(true);
            model.bindToGuest(gs);
        }
    }

    refreshGuestList(model);
    changingMode = false;
}
