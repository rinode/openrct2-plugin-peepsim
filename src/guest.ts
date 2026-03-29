import {
    PeepSimModel,
    AccessoryType,
    ACCESSORY_TYPES,
    COLOUR_ACCESSORIES,
    ACTION_EXCLUDE,
    ACTION_LABELS,
    GuestEntry,
    GuestState,
    createGuestState,
    guestStates
} from "./model";

export function getSelectedGuest(model: PeepSimModel): Guest | null {
    const id = model.selectedGuestId.get();
    if (id === null) return null;
    const entity = map.getEntity(id);
    if (!entity || entity.type !== "guest") {
        model.selectedGuestId.set(null);
        model.guestTarget.set(null);
        return null;
    }
    return entity as Guest;
}

export function getGuestById(id: number): Guest | null {
    const entity = map.getEntity(id);
    if (!entity || entity.type !== "guest") return null;
    return entity as Guest;
}

// ── State swap ─────────────────────────────────────────────────────────

/**
 * Release a direct-mode guest when the UI detaches (close window / switch guest).
 * Unfreezes the guest entity and removes it from global state.
 */
export function releaseDirectGuest(model: PeepSimModel): void {
    var id = model.selectedGuestId.get();
    if (id === null) return;
    if (model.selectedMode.get() !== 1) return;

    var entity = map.getEntity(id);
    if (entity && entity.type === "guest") {
        unfreezeGuestEntity(entity as Guest);
    }
    delete guestStates[id];
}

export function saveCurrentGuestState(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    if (id === null) return;

    const modeIndex = model.selectedMode.get();
    // Direct mode is UI-only — release instead of saving
    if (modeIndex === 1) {
        releaseDirectGuest(model);
        return;
    }

    var mode: "uncontrolled" | "direct" | "queued" = "uncontrolled";
    if (modeIndex === 2) mode = "queued";

    var gs = guestStates[id];
    if (!gs) {
        gs = createGuestState();
        guestStates[id] = gs;
    }

    gs.mode = mode;
    gs.actionQueue = model.actionQueue.get().slice();
    gs.currentAction = model.currentAction;
    gs.queuePaused = model.queuePaused.get();
    gs.queueExecutingIndex = model.queueExecutingIndex.get();
    gs.keepSteps = model.keepSteps.get();
    gs.loopQueue = model.loopQueue.get();
    gs.heldDirection = model.heldDirection.get();
    gs.moveTickCount = model.moveTickCount;
    gs.lastMoveDist = model.lastMoveDist;
    gs.actionTickCount = model.actionTickCount;
}

export function loadGuestState(model: PeepSimModel, guestId: number): void {
    var gs = guestStates[guestId];
    if (!gs) {
        gs = createGuestState();
        guestStates[guestId] = gs;
    }

    var modeIndex = 0;
    if (gs.mode === "direct") modeIndex = 1;
    else if (gs.mode === "queued") modeIndex = 2;

    model.selectedMode.set(modeIndex);
    model.actionQueue.set(gs.actionQueue.slice());
    model.currentAction = gs.currentAction;
    model.queuePaused.set(gs.queuePaused);
    model.queueExecutingIndex.set(gs.queueExecutingIndex);
    model.keepSteps.set(gs.keepSteps);
    model.loopQueue.set(gs.loopQueue);
    model.heldDirection.set(gs.heldDirection);
    model.moveTickCount = gs.moveTickCount;
    model.lastMoveDist = gs.lastMoveDist;
    model.actionTickCount = gs.actionTickCount;
}

export function ensureGuestState(model: PeepSimModel, guestId: number): GuestState {
    var gs = guestStates[guestId];
    if (!gs) {
        gs = createGuestState();
        guestStates[guestId] = gs;
    }
    return gs;
}

// ── Guest selection ────────────────────────────────────────────────────

export function selectGuest(model: PeepSimModel, id: number): void {
    model.selectedGuestId.set(id);
    model.guestTarget.set(id);
    syncAccessoriesFromGuest(model);
    refreshActionAnimations(model);
}

export function spawnGuest(model: PeepSimModel): Guest | null {
    const guest = park.generateGuest();
    if (guest && guest.id !== null) {
        model.selectedGuestId.set(guest.id);
        model.guestTarget.set(guest.id);
        context.executeAction("guestsetname", { peep: guest.id, name: "PeepSim" }, () => {});
        var gs = createGuestState();
        gs.mode = "direct";
        guestStates[guest.id] = gs;
        model.selectedMode.set(1);
    }
    return guest;
}

export function refreshGuestList(model: PeepSimModel): void {
    const list: GuestEntry[] = map.getAllEntities("guest")
        .filter(g => g.id !== null)
        .map(g => ({
            id: g.id as number,
            name: (g as Guest).name
        }));

    const currentId = model.selectedGuestId.get();
    const newIdx = (currentId !== null)
        ? (list.findIndex(g => g.id === currentId) + 1) || 0
        : 0;

    model.isRefreshing = true;
    model.guestList.set(list);
    model.selectedGuestIndex.set(newIdx);
    model.isRefreshing = false;
}

// ── Find guest ─────────────────────────────────────────────────────────

export function findGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;
    ui.mainViewport.scrollTo({ x: guest.x, y: guest.y });
}

// ── Freeze / unfreeze ──────────────────────────────────────────────────

export function freezeGuestEntity(guest: Guest): void {
    guest.setFlag("positionFrozen", true);
    guest.animation = "watchRide";
    guest.animationOffset = 0;
}

export function unfreezeGuestEntity(guest: Guest): void {
    guest.setFlag("positionFrozen", false);
    guest.animation = "walking";
    guest.animationOffset = 0;
}

export function freezeGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (guest) {
        freezeGuestEntity(guest);
    }
    model.guestFrozen.set(true);
}

export function unfreezeGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (guest) {
        unfreezeGuestEntity(guest);
    }
    model.guestFrozen.set(false);
}

// ── Accessories ────────────────────────────────────────────────────────

export function setAccessory(model: PeepSimModel, type: AccessoryType | null): void {
    const prev = model.accessoryActive.get();
    model.accessoryActive.set(type);

    const guest = getSelectedGuest(model);
    if (!guest) return;

    if (prev) {
        guest.removeItem({ type: prev });
    }

    if (type) {
        guest.giveItem({ type: type });
        if (COLOUR_ACCESSORIES[type]) {
            applyAccessoryColour(model, guest, type);
        }
    }

    if (model.selectedMode.get() !== 0) {
        freezeGuest(model);
    }
}

export function setAccessoryColour(model: PeepSimModel, colour: number): void {
    model.accessoryColour.set(colour);
    const guest = getSelectedGuest(model);
    if (!guest) return;
    const type = model.accessoryActive.get();
    if (type && COLOUR_ACCESSORIES[type]) {
        applyAccessoryColour(model, guest, type);
    }
}

function applyAccessoryColour(model: PeepSimModel, guest: Guest, type: string): void {
    const colour = model.accessoryColour.get();
    if (type === "hat") guest.hatColour = colour;
    if (type === "balloon") guest.balloonColour = colour;
    if (type === "umbrella") guest.umbrellaColour = colour;
}

export function enforceAccessories(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    const active = model.accessoryActive.get();
    if (active && !guest.hasItem({ type: active })) {
        guest.giveItem({ type: active });
        if (COLOUR_ACCESSORIES[active]) {
            applyAccessoryColour(model, guest, active);
        }
    }
}

export function syncAccessoriesFromGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    model.accessoryActive.set(null);
    model.accessoryColour.set(0);
    model.accessoryIndex.set(0);

    for (let i = 1; i < ACCESSORY_TYPES.length; i++) {
        const type = ACCESSORY_TYPES[i]!;
        if (guest.hasItem({ type })) {
            model.accessoryActive.set(type);
            model.accessoryIndex.set(i);
            if (type === "hat") model.accessoryColour.set(guest.hatColour);
            else if (type === "balloon") model.accessoryColour.set(guest.balloonColour);
            else if (type === "umbrella") model.accessoryColour.set(guest.umbrellaColour);
            break;
        }
    }
}

export function syncAppearanceFromGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;
    model.guestFrozen.set(guest.getFlag("positionFrozen"));
    model.shirtColour.set(guest.tshirtColour);
    model.pantsColour.set(guest.trousersColour);
    syncAccessoriesFromGuest(model);
}

// ── Action animations ──────────────────────────────────────────────────

export function refreshActionAnimations(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) {
        model.actionAnimations.set([]);
        model.actionLabels.set(["(no guest)"]);
        model.queueActionAnimations.set([]);
        model.queueActionLabels.set(["(none)"]);
        return;
    }

    const available: string[] = (guest as any).availableAnimations || [];
    const anims: string[] = [];
    const labels: string[] = [];
    for (const anim of available) {
        if (ACTION_EXCLUDE.indexOf(anim) >= 0) continue;
        labels.push(ACTION_LABELS[anim] || anim);
        anims.push(anim);
    }

    model.actionAnimations.set(anims);
    model.actionLabels.set(labels.length > 0 ? labels : ["(none available)"]);
    model.selectedActionIndex.set(0);

    model.queueActionAnimations.set(anims);
    model.queueActionLabels.set(labels.length > 0 ? labels : ["(none)"]);
    model.selectedQueueActionIndex.set(0);
}

// ── Reset ──────────────────────────────────────────────────────────────

export function resetState(model: PeepSimModel): void {
    model.selectedGuestId.set(null);
    model.guestTarget.set(null);
    model.selectedGuestIndex.set(0);
    model.guestList.set([]);
    model.selectedMode.set(0);
    model.accessoryActive.set(null);
    model.accessoryColour.set(0);
    model.accessoryIndex.set(0);
    model.actionQueue.set([]);
    model.queueListItems.set([]);
    model.queuePaused.set(true);
    model.queueExecutingIndex.set(-1);
    model.keepSteps.set(false);
    model.loopQueue.set(false);
    model.heldDirection.set(-1);
    model.currentAction = null;
    model.moveTickCount = 0;
    model.lastMoveDist = -1;
    model.actionTickCount = 0;
}
