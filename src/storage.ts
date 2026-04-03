import { QueuedAction, GuestState, createGuestState } from "./model";
import { guestStates, resetAllGuestStates } from "./state";

interface SerializedGuestState {
    mode: string;
    actionQueue: QueuedAction[];
    currentAction: QueuedAction | null;
    queuePaused: boolean;
    queueExecutingIndex: number;
    keepSteps: boolean;
    loopQueue: boolean;
    moveTickCount: number;
    lastMoveDist: number;
    actionTickCount: number;
}

interface SerializedPluginState {
    version: number;
    guests: { [id: string]: SerializedGuestState };
}

const STORAGE_KEY = "peepsim.state";

export function savePluginState(): void {
    const guests: { [id: string]: SerializedGuestState } = {};

    var ids = Object.keys(guestStates);
    for (var j = 0; j < ids.length; j++) {
        var gid = parseInt(ids[j], 10);
        if (isNaN(gid)) continue;
        var gs = guestStates[gid];
        if (!gs) continue;

        // Verify guest still exists
        var entity = map.getEntity(gid);
        if (!entity || entity.type !== "guest") continue;

        guests[String(gid)] = {
            mode: gs.mode,
            actionQueue: gs.actionQueue.slice(),
            currentAction: gs.currentAction,
            queuePaused: gs.queuePaused,
            queueExecutingIndex: gs.queueExecutingIndex,
            keepSteps: gs.keepSteps,
            loopQueue: gs.loopQueue,
            moveTickCount: gs.moveTickCount,
            lastMoveDist: gs.lastMoveDist,
            actionTickCount: gs.actionTickCount
        };
    }

    const state: SerializedPluginState = {
        version: 1,
        guests: guests
    };

    context.getParkStorage().set(STORAGE_KEY, state);
}

/** Load guestStates from park storage into the global singleton. */
export function loadPluginState(): void {
    const raw = context.getParkStorage().get<SerializedPluginState>(STORAGE_KEY);
    if (!raw || !raw.guests) return;

    resetAllGuestStates();

    var keys = Object.keys(raw.guests);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var id = parseInt(key, 10);
        if (isNaN(id)) continue;

        // Verify guest still exists
        var entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") continue;

        var saved = raw.guests[key];
        var gs = createGuestState();

        if (saved.mode === "direct") gs.mode = "direct";
        else if (saved.mode === "queued") gs.mode = "queued";
        else gs.mode = "uncontrolled";

        if (saved.actionQueue && Array.isArray(saved.actionQueue)) {
            gs.actionQueue = saved.actionQueue;
        }
        gs.currentAction = saved.currentAction || null;
        gs.queuePaused = saved.queuePaused === true;
        gs.queueExecutingIndex = typeof saved.queueExecutingIndex === "number" ? saved.queueExecutingIndex : -1;
        gs.keepSteps = saved.keepSteps === true;
        gs.loopQueue = saved.loopQueue === true;
        gs.moveTickCount = saved.moveTickCount || 0;
        gs.lastMoveDist = typeof saved.lastMoveDist === "number" ? saved.lastMoveDist : -1;
        gs.actionTickCount = saved.actionTickCount || 0;

        guestStates[id] = gs;

        // Restore entity state based on mode and current action
        if (gs.mode === "direct" || gs.mode === "queued") {
            var guest = entity as Guest;

            if (gs.mode === "queued" && !gs.queuePaused && gs.currentAction) {
                // Guest was actively executing, re-initiate the action
                if (gs.currentAction.type === "move" && gs.currentAction.target) {
                    guest.setFlag("positionFrozen", false);
                    guest.animation = "walking";
                    guest.animationOffset = 0;
                    guest.destination = {
                        x: gs.currentAction.target.x * 32 + 16,
                        y: gs.currentAction.target.y * 32 + 16
                    };
                } else if (gs.currentAction.type === "action") {
                    guest.setFlag("positionFrozen", true);
                    guest.animation = gs.currentAction.animation! as GuestAnimation;
                    guest.animationOffset = 0;
                }
            } else {
                // Paused, direct mode, or no current action: idle freeze
                guest.setFlag("positionFrozen", true);
                guest.animation = "watchRide";
                guest.animationOffset = 0;
            }
        }
    }
}
