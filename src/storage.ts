import { QueuedAction, GuestMode, ActionType, createGuestState } from "./model";
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
    guests: Record<string, SerializedGuestState>;
}

const STORAGE_KEY = "peepsim.state";

export function savePluginState(): void {
    const guests: Record<string, SerializedGuestState> = {};

    for (const [id, gs] of guestStates) {
        const entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") continue;

        guests[String(id)] = {
            mode: gs.mode.get(),
            actionQueue: gs.actionQueue.get().slice(),
            currentAction: gs.currentAction,
            queuePaused: gs.queuePaused.get(),
            queueExecutingIndex: gs.queueExecutingIndex.get(),
            keepSteps: gs.keepSteps.get(),
            loopQueue: gs.loopQueue.get(),
            moveTickCount: gs.moveTickCount,
            lastMoveDist: gs.lastMoveDist,
            actionTickCount: gs.actionTickCount,
        };
    }

    const state: SerializedPluginState = { version: 1, guests };
    context.getParkStorage().set(STORAGE_KEY, state);
}

export function loadPluginState(): void {
    const raw = context.getParkStorage().get<SerializedPluginState>(STORAGE_KEY);
    if (!raw?.guests) return;

    resetAllGuestStates();

    for (const [key, saved] of Object.entries(raw.guests)) {
        const id = parseInt(key, 10);
        if (isNaN(id)) continue;

        const entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") continue;

        const gs = createGuestState();

        // Map saved mode string to enum (handle legacy "queued" → Sequence)
        if (saved.mode === GuestMode.Direct) gs.mode.set(GuestMode.Direct);
        else if (saved.mode === GuestMode.Sequence || saved.mode === "queued") gs.mode.set(GuestMode.Sequence);
        else gs.mode.set(GuestMode.Uncontrolled);

        if (Array.isArray(saved.actionQueue)) {
            // Normalize legacy action types
            const queue = saved.actionQueue.map(a => ({
                ...a,
                type: a.type === ActionType.Move ? ActionType.Move : ActionType.Action,
            }));
            gs.actionQueue.set(queue);
        }
        gs.currentAction = saved.currentAction ?? null;
        gs.queuePaused.set(saved.queuePaused === true);
        gs.queueExecutingIndex.set(typeof saved.queueExecutingIndex === "number" ? saved.queueExecutingIndex : -1);
        gs.keepSteps.set(saved.keepSteps === true);
        gs.loopQueue.set(saved.loopQueue === true);
        gs.moveTickCount = saved.moveTickCount ?? 0;
        gs.lastMoveDist = typeof saved.lastMoveDist === "number" ? saved.lastMoveDist : -1;
        gs.actionTickCount = saved.actionTickCount ?? 0;

        guestStates.set(id, gs);

        // Restore entity state based on mode and current action
        const mode = gs.mode.get();
        if (mode === GuestMode.Direct || mode === GuestMode.Sequence) {
            const guest = entity as Guest;

            if (mode === GuestMode.Sequence && !gs.queuePaused.get() && gs.currentAction) {
                if (gs.currentAction.type === ActionType.Move && gs.currentAction.target) {
                    guest.setFlag("positionFrozen", false);
                    guest.animation = "walking";
                    guest.animationOffset = 0;
                    guest.destination = {
                        x: gs.currentAction.target.x * 32 + 16,
                        y: gs.currentAction.target.y * 32 + 16,
                    };
                } else if (gs.currentAction.type === ActionType.Action) {
                    guest.setFlag("positionFrozen", true);
                    guest.animation = gs.currentAction.animation! as GuestAnimation;
                    guest.animationOffset = 0;
                }
            } else {
                guest.setFlag("positionFrozen", true);
                guest.animation = "watchRide";
                guest.animationOffset = 0;
            }
        }
    }
}
