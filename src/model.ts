import { store, compute, WritableStore, Store } from "openrct2-flexui";

// ── Types ──────────────────────────────────────────────────────────────

export type AccessoryType = "hat" | "sunglasses" | "balloon" | "umbrella";

export interface QueuedAction {
    type: "move" | "action";
    target?: { x: number; y: number };
    animation?: string;
    duration?: number;
}

export interface GuestEntry {
    id: number;
    name: string;
}

export const ACCESSORY_TYPES: (AccessoryType | null)[] = [null, "hat", "sunglasses", "balloon", "umbrella"];
export const COLOUR_ACCESSORIES: Record<string, boolean> = { hat: true, balloon: true, umbrella: true };
export const DEFAULT_COLOURS: Record<string, number> = { hat: 6, balloon: 14, umbrella: 0 };

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
    eatFood: "Eat Food"
};

export const ACTION_EXCLUDE = [
    "walking", "watchRide", "holdMat",
    "sittingIdle", "sittingEatFood",
    "sittingLookAroundLeft", "sittingLookAroundRight",
    "hanging", "drowning"
];

// ── ViewModel ──────────────────────────────────────────────────────────

export class PeepSimModel {
    // Guest state
    readonly selectedGuestId: WritableStore<number | null> = store<number | null>(null);
    readonly guestList: WritableStore<GuestEntry[]> = store<GuestEntry[]>([]);
    readonly selectedGuestIndex: WritableStore<number> = store(0);

    // Computed: the actual guest entity (re-derived each update)
    readonly guestTarget: WritableStore<number | null> = store<number | null>(null);

    // Control mode
    readonly controlMode: WritableStore<"direct" | "queued"> = store<"direct" | "queued">("direct");

    // Direct control
    readonly heldDirection: WritableStore<number> = store(-1);
    readonly moveToolActive: WritableStore<boolean> = store(false);
    readonly guestFrozen: WritableStore<boolean> = store(false);

    // Queued control
    readonly queuePaused: WritableStore<boolean> = store(true);
    readonly actionQueue: WritableStore<QueuedAction[]> = store<QueuedAction[]>([]);
    readonly queueListItems: WritableStore<string[][]> = store<string[][]>([]);
    readonly queueSelectedRow: WritableStore<number> = store(-1);

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

    // Has-guest computed
    readonly hasGuest: Store<boolean> = compute(this.selectedGuestId, id => id !== null);
    readonly noGuest: Store<boolean> = compute(this.selectedGuestId, id => id === null);

    // Internals (not stores — runtime state for tick executor)
    isRefreshing = false;
    tabSwitching = false;
    tickInterval: number | null = null;
    directionInterval: number | null = null;
    actionPlayInterval: number | null = null;
    currentAction: QueuedAction | null = null;
    moveTickCount = 0;
    lastMoveDist = -1;
    actionTickCount = 0;
    guestRefreshCounter = 0;
    pauseSlotNormal = -1;
    pauseSlotPressed = -1;
    lastTabIndex = -1;
}
