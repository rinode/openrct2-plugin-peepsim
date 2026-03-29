import { PeepSimModel, QueuedAction, ACTION_LABELS } from "./model";
import { getSelectedGuest, freezeGuest, unfreezeGuest } from "./guest";

export function addAction(model: PeepSimModel, action: QueuedAction): void {
    const queue = model.actionQueue.get().slice();
    queue.push(action);
    model.actionQueue.set(queue);
    refreshQueueList(model);
}

export function removeAction(model: PeepSimModel, index: number): void {
    const queue = model.actionQueue.get().slice();
    queue.splice(index, 1);
    model.actionQueue.set(queue);
    refreshQueueList(model);
}

export function clearActions(model: PeepSimModel): void {
    model.actionQueue.set([]);
    model.currentAction = null;
    model.actionTickCount = 0;
    refreshQueueList(model);
}

export function refreshQueueList(model: PeepSimModel): void {
    const actions = model.actionQueue.get();
    const items: string[][] = actions.map((a, i) => {
        let desc: string;
        if (a.type === "action") {
            const label = ACTION_LABELS[a.animation!] || a.animation!;
            desc = `${label} (${a.duration || 3}s)`;
        } else {
            desc = `Move \u2192 ${a.target!.x}, ${a.target!.y}`;
        }
        return [String(i + 1), desc];
    });
    model.queueListItems.set(items);
}

export function pauseQueue(model: PeepSimModel): void {
    model.queuePaused.set(true);
    freezeGuest(model);
}

export function resumeQueue(model: PeepSimModel): void {
    model.queuePaused.set(false);
    const guest = getSelectedGuest(model);
    if (!guest) return;

    const current = model.currentAction;
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

export function directMove(model: PeepSimModel, tileX: number, tileY: number, skipHighlight?: boolean): void {
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
    if (!skipHighlight) {
        highlightTarget(tileX, tileY);
    } else {
        clearHighlight();
    }
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
    clearHighlight();
}

export function startExecutor(model: PeepSimModel): void {
    if (model.tickInterval !== null) return;
    model.tickInterval = context.setInterval(() => {
        executeTick(model);
    }, 100);
}

export function stopExecutor(model: PeepSimModel): void {
    if (model.tickInterval !== null) {
        context.clearInterval(model.tickInterval);
        model.tickInterval = null;
    }
}

export function highlightTarget(tileX: number, tileY: number): void {
    ui.tileSelection.tiles = [{ x: tileX * 32, y: tileY * 32 }];
}

export function clearHighlight(): void {
    ui.tileSelection.tiles = [];
}

function finishCurrentAction(model: PeepSimModel): void {
    model.currentAction = null;
    model.moveTickCount = 0;
    model.lastMoveDist = -1;
    model.actionTickCount = 0;
    clearHighlight();

    if (model.actionQueue.get().length === 0) {
        freezeGuest(model);
        model.queuePaused.set(true);
    }
}

function executeTick(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;
    if (model.queuePaused.get()) return;

    const current = model.currentAction;
    if (current !== null) {
        if (current.type === "action") {
            model.actionTickCount++;
            const durationTicks = (current.duration || 3) * 10;
            if (model.actionTickCount >= durationTicks) {
                finishCurrentAction(model);
            }
            return;
        }

        if (current.target) {
            const targetX = current.target.x * 32 + 16;
            const targetY = current.target.y * 32 + 16;
            const dx = guest.x - targetX;
            const dy = guest.y - targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 32) {
                finishCurrentAction(model);
                return;
            }

            model.moveTickCount++;
            if (model.moveTickCount % 10 === 0) {
                if (model.lastMoveDist >= 0 && Math.abs(dist - model.lastMoveDist) < 4) {
                    guest.destination = { x: targetX, y: targetY };
                }
                model.lastMoveDist = dist;
            }
        }
        return;
    }

    const queue = model.actionQueue.get();
    if (queue.length === 0) return;

    const next = queue[0];
    model.actionQueue.set(queue.slice(1));
    model.currentAction = next;
    model.moveTickCount = 0;
    model.lastMoveDist = -1;
    model.actionTickCount = 0;

    if (next.type === "action") {
        freezeGuest(model);
        guest.animation = next.animation! as GuestAnimation;
        guest.animationOffset = 0;
    } else if (next.target) {
        unfreezeGuest(model);
        guest.destination = {
            x: next.target.x * 32 + 16,
            y: next.target.y * 32 + 16
        };
        highlightTarget(next.target.x, next.target.y);
    }

    refreshQueueList(model);
}

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

export function activateMoveTool(model: PeepSimModel): void {
    if (!getSelectedGuest(model)) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }
    stopDirectionWalk(model);
    model.moveToolActive.set(true);
    ui.activateTool({
        id: "peepsim-move",
        cursor: "walk_down",
        filter: ["terrain"],
        onMove: (e: ToolEventArgs) => {
            if (e.mapCoords) {
                ui.tileSelection.tiles = [{ x: e.mapCoords.x, y: e.mapCoords.y }];
            }
        },
        onDown: (e: ToolEventArgs) => {
            if (e.mapCoords) {
                const tileX = Math.floor(e.mapCoords.x / 32);
                const tileY = Math.floor(e.mapCoords.y / 32);
                if (model.controlMode.get() === "direct") {
                    directMove(model, tileX, tileY);
                } else {
                    addAction(model, { type: "move", target: { x: tileX, y: tileY } });
                }
            }
        },
        onFinish: () => {
            model.moveToolActive.set(false);
            clearHighlight();
        }
    });
}

export function deactivateMoveTool(model: PeepSimModel): void {
    if (ui.tool && ui.tool.id === "peepsim-move") {
        ui.tool.cancel();
    }
    model.moveToolActive.set(false);
}

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
