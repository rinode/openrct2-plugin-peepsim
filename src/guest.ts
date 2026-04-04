import {
    PeepSimModel,
    AccessoryType,
    ACCESSORY_TYPES,
    COLOUR_ACCESSORIES,
    ACTION_EXCLUDE,
    ACTION_LABELS,
    GuestEntry,
    createGuestState
} from "./model";
import { guestStates, ensureGuestState, projectToUI } from "./state";

export function getSelectedGuest(model: PeepSimModel): Guest | null {
    const id = model.selectedGuestId.get();
    if (id === null) return null;
    const entity = map.getEntity(id);
    if (!entity || entity.type !== "guest") return null;
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

// ── Guest selection ────────────────────────────────────────────────────

export function selectGuest(model: PeepSimModel, id: number): void {
    model.selectedGuestId.set(id);
    model.guestTarget.set(id);
    projectToUI(model);
    syncAccessoriesFromGuest(model);
    refreshActionAnimations(model);
}

export function spawnGuest(model: PeepSimModel): Guest | null {
    const guest = park.generateGuest();
    if (guest && guest.id !== null) {
        model.selectedGuestId.set(guest.id);
        model.guestTarget.set(guest.id);
        context.executeAction("guestsetname", { peep: guest.id, name: "PeepSim" }, () => {});
        var gs = ensureGuestState(guest.id);
        gs.mode = "direct";
        projectToUI(model);
    }
    return guest;
}

export function refreshGuestList(model: PeepSimModel): void {
    const currentId = model.selectedGuestId.get();
    var ids = Object.keys(guestStates);
    var list: GuestEntry[] = [];
    for (var i = 0; i < ids.length; i++) {
        var id = parseInt(ids[i], 10);
        if (isNaN(id)) continue;
        var gs = guestStates[id];
        // Skip uncontrolled guests unless currently selected
        if (gs && gs.mode === "uncontrolled" && id !== currentId) continue;
        var entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") continue;
        list.push({ id: id, name: (entity as Guest).name });
    }

    // If the selected guest is valid but not in guestStates (uncontrolled),
    // include it so the dropdown doesn't eject the selection.
    if (currentId !== null && !guestStates[currentId]) {
        var entity = map.getEntity(currentId);
        if (entity && entity.type === "guest") {
            list.push({ id: currentId, name: (entity as Guest).name });
        }
    }

    // Build dropdown items (plain strings, no compute chain)
    var items: string[] = ["(none)"];
    for (var j = 0; j < list.length; j++) {
        items.push(list[j].name);
    }

    const newIdx = (currentId !== null)
        ? (list.findIndex(g => g.id === currentId) + 1) || 0
        : 0;

    // Build listview items (for guest list panel)
    var listViewItems: string[][] = [];
    for (var k = 0; k < list.length; k++) {
        var ge = list[k];
        var gs3 = guestStates[ge.id];
        var mode = "";
        if (gs3) {
            if (gs3.mode === "direct") mode = "Direct";
            else if (gs3.mode === "queued") mode = "Queued";
        }
        listViewItems.push([ge.name, mode]);
    }
    model.guestListViewItems.set(listViewItems);

    model.guestList.set(list);
    model.guestDropdownItems.set(items);
    // Force re-apply: items.set() resets widget to 0, so if the store
    // already has newIdx, .set() is a no-op. Sentinel forces the update.
    if (model.selectedGuestIndex.get() === newIdx) {
        model.selectedGuestIndex.set(-1);
    }
    model.selectedGuestIndex.set(newIdx);
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

    if (model.selectedMode.get() === 1) {
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
    model.guestDropdownItems.set(["(none)"]);
    model.accessoryActive.set(null);
    model.accessoryColour.set(0);
    model.accessoryIndex.set(0);
    model.queueSelectedCell.set(null);
    projectToUI(model);
}
