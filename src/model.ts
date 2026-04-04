import { store, compute, WritableStore, Store } from "openrct2-flexui";
import { Signal, bridge } from "./signal";

// ── Enums ─────────────────────────────────────────────────────────────

export enum GuestMode {
    Uncontrolled = "uncontrolled",
    Direct = "direct",
    Sequence = "sequence",
}

export enum AccessoryType {
    Hat = "hat",
    Sunglasses = "sunglasses",
    Balloon = "balloon",
    Umbrella = "umbrella",
}

export enum ActionType {
    Move = "move",
    Action = "action",
}

// ── Types ─────────────────────────────────────────────────────────────

export interface QueuedAction {
    type: ActionType;
    target?: { x: number; y: number };
    animation?: string;
    duration?: number;
}

export interface GuestEntry {
    id: number;
    name: string;
}

export interface GuestState {
    // UI-visible (signals — subscriptions auto-propagate to model)
    mode: Signal<GuestMode>;
    actionQueue: Signal<QueuedAction[]>;
    queuePaused: Signal<boolean>;
    queueExecutingIndex: Signal<number>;
    keepSteps: Signal<boolean>;
    loopQueue: Signal<boolean>;
    heldDirection: Signal<number>;
    // Executor-internal (plain values)
    currentAction: QueuedAction | null;
    moveTickCount: number;
    lastMoveDist: number;
    actionTickCount: number;
}

export function createGuestState(): GuestState {
    return {
        mode: new Signal<GuestMode>(GuestMode.Uncontrolled),
        actionQueue: new Signal<QueuedAction[]>([]),
        queuePaused: new Signal(true),
        queueExecutingIndex: new Signal(-1),
        keepSteps: new Signal(false),
        loopQueue: new Signal(false),
        heldDirection: new Signal(-1),
        currentAction: null,
        moveTickCount: 0,
        lastMoveDist: -1,
        actionTickCount: 0,
    };
}

// ── Constants ─────────────────────────────────────────────────────────

export const ACCESSORY_TYPES: (AccessoryType | null)[] = [
    null, AccessoryType.Hat, AccessoryType.Sunglasses,
    AccessoryType.Balloon, AccessoryType.Umbrella,
];

export const COLOUR_ACCESSORIES = new Set([
    AccessoryType.Hat, AccessoryType.Balloon, AccessoryType.Umbrella,
]);

export const DEFAULT_COLOURS: Record<string, number> = {
    [AccessoryType.Hat]: 6,
    [AccessoryType.Balloon]: 14,
    [AccessoryType.Umbrella]: 0,
};

export const MODE_LABELS = ["Uncontrolled", "Direct", "Sequence"];

const MODE_INDEX: Record<GuestMode, number> = {
    [GuestMode.Uncontrolled]: 0,
    [GuestMode.Direct]: 1,
    [GuestMode.Sequence]: 2,
};

export const ACTION_LABELS: Record<string, string> = {
    jump: "Jump",
    takePhoto: "Take Photo",
    wave: "Wave",
    wave2: "Wave (alt)",
    clap: "Clap",
    joy: "Joy",
    wow: "Wow",
    checkTime: "Check Time",
    readMap: "Read Map",
    drawPicture: "Draw Picture",
    disgust: "Disgust",
    throwUp: "Throw Up",
    shakeHead: "Shake Head",
    beingWatched: "Being Watched",
    withdrawMoney: "Withdraw Money",
    emptyPockets: "Empty Pockets",
    eatFood: "Eat Food",
};

export const ACTION_EXCLUDE = new Set([
    "walking", "watchRide", "holdMat",
    "sittingIdle", "sittingEatFood",
    "sittingLookAroundLeft", "sittingLookAroundRight",
    "hanging", "drowning",
]);

// ── Queue display list builder ────────────────────────────────────────

function rebuildQueueList(model: PeepSimModel, gs: GuestState): void {
    const actions = gs.actionQueue.get();
    const execIdx = gs.queueExecutingIndex.get();
    const paused = gs.queuePaused.get();
    const items: string[][] = [];
    for (let i = 0; i < actions.length; i++) {
        const a = actions[i];
        let desc: string;
        if (a.type === ActionType.Action) {
            const label = ACTION_LABELS[a.animation!] ?? a.animation!;
            desc = `${label} (${a.duration ?? 3}s)`;
        } else {
            desc = `Move → ${a.target!.x}, ${a.target!.y}`;
        }
        let status = "";
        if (i === execIdx) {
            status = paused ? "||" : "▶";
        }
        items.push([status, String(i + 1), desc]);
    }
    model.queueListItems.set(items);
}

// ── ViewModel ─────────────────────────────────────────────────────────

export class PeepSimModel {

    // Guest selection
    readonly selectedGuestId: WritableStore<number | null> = store<number | null>(null);
    readonly guestList: WritableStore<GuestEntry[]> = store<GuestEntry[]>([]);
    readonly guestDropdownItems: WritableStore<string[]> = store<string[]>(["(none)"]);
    readonly selectedGuestIndex: WritableStore<number> = store(0);
    readonly guestTarget: WritableStore<number | null> = store<number | null>(null);

    // Mode for current guest (0=uncontrolled, 1=direct, 2=sequence)
    readonly selectedMode: WritableStore<number> = store(0);

    // Direct control
    readonly heldDirection: WritableStore<number> = store(-1);
    readonly moveToolActive: WritableStore<boolean> = store(false);
    readonly guestFrozen: WritableStore<boolean> = store(false);

    // Sequence control
    readonly queuePaused: WritableStore<boolean> = store(true);
    readonly actionQueue: WritableStore<QueuedAction[]> = store<QueuedAction[]>([]);
    readonly queueListItems: WritableStore<string[][]> = store<string[][]>([]);
    readonly queueSelectedCell: WritableStore<{ row: number; column: number } | null> = store<{ row: number; column: number } | null>(null);
    readonly keepSteps: WritableStore<boolean> = store(false);
    readonly loopQueue: WritableStore<boolean> = store(false);
    readonly queueExecutingIndex: WritableStore<number> = store(-1);

    // Picker tool
    readonly pickerActive: WritableStore<boolean> = store(false);

    // Appearance
    readonly accessoryActive: WritableStore<AccessoryType | null> = store<AccessoryType | null>(null);
    readonly accessoryColour: WritableStore<number> = store(0);
    readonly shirtColour: WritableStore<number> = store(0);
    readonly pantsColour: WritableStore<number> = store(0);
    readonly accessoryIndex: WritableStore<number> = store(0);

    // Action dropdowns
    readonly actionAnimations: WritableStore<string[]> = store<string[]>([]);
    readonly actionLabels: WritableStore<string[]> = store<string[]>([]);
    readonly selectedActionIndex: WritableStore<number> = store(0);
    readonly queueActionAnimations: WritableStore<string[]> = store<string[]>([]);
    readonly queueActionLabels: WritableStore<string[]> = store<string[]>([]);
    readonly selectedQueueActionIndex: WritableStore<number> = store(0);
    readonly queueDuration: WritableStore<number> = store(3);

    // Guest list (custom picker replaces dropdown)
    readonly guestListVisible: WritableStore<boolean> = store(false);
    readonly guestListViewItems: WritableStore<string[][]> = store<string[][]>([]);
    readonly selectedGuestName: Store<string> = compute(
        this.selectedGuestIndex, this.guestDropdownItems,
        (idx, items) => idx > 0 && idx < items.length ? items[idx] : "(none)"
    );

    // Has-guest computed
    readonly hasGuest: Store<boolean> = compute(this.selectedGuestId, id => id !== null);
    readonly noGuest: Store<boolean> = compute(this.selectedGuestId, id => id === null);

    // UI-only timer handles
    directionInterval: number | null = null;
    actionPlayInterval: number | null = null;

    // Main window position (updated each tick for popup positioning)
    mainWindowX = 0;
    mainWindowY = 0;
    mainWindowWidth = 300;

    // Guest signal subscriptions
    private _unsubs: (() => void)[] = [];

    /** Unsubscribe from old guest, subscribe to new guest's signals. */
    bindToGuest(gs: GuestState | null): void {
        for (const unsub of this._unsubs) unsub();
        this._unsubs = [];

        if (!gs) {
            this.selectedMode.set(0);
            this.actionQueue.set([]);
            this.queuePaused.set(true);
            this.queueExecutingIndex.set(-1);
            this.keepSteps.set(false);
            this.loopQueue.set(false);
            this.heldDirection.set(-1);
            this.queueListItems.set([]);
            return;
        }

        // Bridge each signal → FlexUI store (syncs initial value + subscribes)
        this._unsubs.push(
            bridge(gs.mode, { set: (m: GuestMode) => this.selectedMode.set(MODE_INDEX[m]) }),
            bridge(gs.queuePaused, this.queuePaused),
            bridge(gs.actionQueue, this.actionQueue),
            bridge(gs.queueExecutingIndex, this.queueExecutingIndex),
            bridge(gs.keepSteps, this.keepSteps),
            bridge(gs.loopQueue, this.loopQueue),
            bridge(gs.heldDirection, this.heldDirection),
        );

        // Rebuild queue display list when relevant signals change
        rebuildQueueList(this, gs);
        const rebuild = () => rebuildQueueList(this, gs);
        this._unsubs.push(
            gs.actionQueue.subscribe(rebuild),
            gs.queueExecutingIndex.subscribe(rebuild),
            gs.queuePaused.subscribe(rebuild),
        );
    }
}
