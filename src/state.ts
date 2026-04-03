import { PeepSimModel, GuestState, GuestMode, createGuestState, ACTION_LABELS } from "./model";

// ── Centralized guest state ───────────────────────────────────────────

export var guestStates: { [id: number]: GuestState } = {};

export function getGuestState(id: number): GuestState | undefined {
    return guestStates[id];
}

export function ensureGuestState(id: number): GuestState {
    var gs = guestStates[id];
    if (!gs) {
        gs = createGuestState();
        guestStates[id] = gs;
    }
    return gs;
}

export function removeGuestState(id: number): void {
    delete guestStates[id];
}

export function resetAllGuestStates(): void {
    var keys = Object.keys(guestStates);
    for (var i = 0; i < keys.length; i++) {
        delete guestStates[parseInt(keys[i], 10)];
    }
}

// ── Projection guard (prevents dropdown onChange during store updates) ──

var _projecting = false;

export function isProjecting(): boolean {
    return _projecting;
}

export function setProjecting(value: boolean): void {
    _projecting = value;
}

// ── Dirty flag (executor → UI projection) ─────────────────────────────

var _projectionDirty = false;

export function markProjectionDirty(): void {
    _projectionDirty = true;
}

/** Called from onUpdate; no-op when nothing changed. */
export function projectIfDirty(model: PeepSimModel): void {
    if (!_projectionDirty) return;
    _projectionDirty = false;
    projectToUI(model);
}

// ── One-way projection (guestStates → UI stores) ─────────────────────

function modeToIndex(mode: GuestMode): number {
    if (mode === "direct") return 1;
    if (mode === "queued") return 2;
    return 0;
}

/** Push the selected guest's state into the UI stores. */
export function projectToUI(model: PeepSimModel): void {
    _projectionDirty = false;
    _projecting = true;

    var id = model.selectedGuestId.get();
    if (id === null) { projectToUIDefaults(model); _projecting = false; return; }

    var gs = guestStates[id];
    if (!gs) { projectToUIDefaults(model); _projecting = false; return; }

    // Primitives (FlexUI .set() skips if value unchanged)
    model.selectedMode.set(modeToIndex(gs.mode));
    model.keepSteps.set(gs.keepSteps);
    model.loopQueue.set(gs.loopQueue);
    model.heldDirection.set(gs.heldDirection);

    // Track whether display-list-relevant fields changed
    var listDirty = false;

    if (model.queuePaused.get() !== gs.queuePaused) {
        model.queuePaused.set(gs.queuePaused);
        listDirty = true;
    }
    if (model.queueExecutingIndex.get() !== gs.queueExecutingIndex) {
        model.queueExecutingIndex.set(gs.queueExecutingIndex);
        listDirty = true;
    }

    // Array: only clone when queue length changed
    var storeQueue = model.actionQueue.get();
    if (storeQueue.length !== gs.actionQueue.length) {
        model.actionQueue.set(gs.actionQueue.slice());
        listDirty = true;
    }

    // Rebuild display list when any list-visible field changed
    if (listDirty) {
        refreshQueueListFromState(model, gs);
    }

    _projecting = false;
}

/** Reset all projected stores to defaults. */
export function projectToUIDefaults(model: PeepSimModel): void {
    model.selectedMode.set(0);
    model.actionQueue.set([]);
    model.queuePaused.set(true);
    model.queueExecutingIndex.set(-1);
    model.keepSteps.set(false);
    model.loopQueue.set(false);
    model.heldDirection.set(-1);
    model.queueListItems.set([]);
}

/** Build the queue display list from a GuestState. */
function refreshQueueListFromState(model: PeepSimModel, gs: GuestState): void {
    var actions = gs.actionQueue;
    var execIdx = gs.queueExecutingIndex;
    var paused = gs.queuePaused;
    var items: string[][] = [];
    for (var i = 0; i < actions.length; i++) {
        var a = actions[i];
        var desc: string;
        if (a.type === "action") {
            var label = ACTION_LABELS[a.animation!] || a.animation!;
            desc = label + " (" + (a.duration || 3) + "s)";
        } else {
            desc = "Move \u2192 " + a.target!.x + ", " + a.target!.y;
        }
        var status = "";
        if (i === execIdx) {
            status = paused ? "||" : "\u25B6";
        }
        items.push([status, String(i + 1), desc]);
    }
    model.queueListItems.set(items);
}
