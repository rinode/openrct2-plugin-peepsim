import {
    PeepSimModel, AccessoryType, GuestMode,
    ACCESSORY_TYPES, COLOUR_ACCESSORIES, ACTION_EXCLUDE, ACTION_LABELS,
    GuestEntry
} from "./model";
import { guestStates, ensureGuestState } from "./state";

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

// ── State swap ───────────��───────────────────────────��────────────────

export function releaseDirectGuest(model: PeepSimModel): void {
    const id = model.selectedGuestId.get();
    if (id === null) return;
    if (model.selectedMode.get() !== 1) return;

    const entity = map.getEntity(id);
    if (entity?.type === "guest") {
        unfreezeGuestEntity(entity as Guest);
    }
    guestStates.delete(id);
    model.bindToGuest(null);
}

// ── Guest selection ───────��───────────────────────────────────────────

export function selectGuest(model: PeepSimModel, id: number): void {
    model.selectedGuestId.set(id);
    model.guestTarget.set(id);
    const gs = guestStates.get(id) ?? null;
    model.bindToGuest(gs);
    syncAccessoriesFromGuest(model);
    refreshActionAnimations(model);
}

export function spawnGuest(model: PeepSimModel): Guest | null {
    const guest = park.generateGuest();
    if (guest?.id != null) {
        model.selectedGuestId.set(guest.id);
        model.guestTarget.set(guest.id);
        context.executeAction("guestsetname", { peep: guest.id, name: "PeepSim" }, () => {});
        const gs = ensureGuestState(guest.id);
        gs.mode.set(GuestMode.Direct);
        model.bindToGuest(gs);
    }
    return guest;
}

export function refreshGuestList(model: PeepSimModel): void {
    const currentId = model.selectedGuestId.get();
    const list: GuestEntry[] = [];

    for (const [id, gs] of guestStates) {
        // Skip uncontrolled guests unless currently selected
        if (gs.mode.get() === GuestMode.Uncontrolled && id !== currentId) continue;
        const entity = map.getEntity(id);
        if (!entity || entity.type !== "guest") continue;
        list.push({ id, name: (entity as Guest).name });
    }

    // If the selected guest is valid but not in guestStates (uncontrolled),
    // include it so the name label doesn't lose the selection.
    if (currentId !== null && !guestStates.has(currentId)) {
        const entity = map.getEntity(currentId);
        if (entity?.type === "guest") {
            list.push({ id: currentId, name: (entity as Guest).name });
        }
    }

    // Build dropdown items (used by selectedGuestName compute)
    const items: string[] = ["(none)"];
    for (const g of list) {
        items.push(g.name);
    }

    const newIdx = currentId !== null
        ? (list.findIndex(g => g.id === currentId) + 1) || 0
        : 0;

    // Build listview items (for guest picker popup)
    const listViewItems: string[][] = [];
    for (const g of list) {
        const gs = guestStates.get(g.id);
        let mode = "";
        if (gs) {
            const m = gs.mode.get();
            if (m === GuestMode.Direct) mode = "Direct";
            else if (m === GuestMode.Sequence) mode = "Sequence";
        }
        listViewItems.push([g.name, mode]);
    }
    model.guestListViewItems.set(listViewItems);

    model.guestList.set(list);
    // Force re-apply: items.set() resets widget to 0, so if the store
    // already has newIdx, .set() is a no-op. Sentinel forces the update.
    if (model.selectedGuestIndex.get() === newIdx) {
        model.selectedGuestIndex.set(-1);
    }
    model.guestDropdownItems.set(items);
    model.selectedGuestIndex.set(newIdx);
}

// ── Find guest ───────────────────────────────────────────────���────────

export function findGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;
    ui.mainViewport.scrollTo({ x: guest.x, y: guest.y });
}

// ── Freeze / unfreeze ──────���──────────────────────────────────────────

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
    if (guest) freezeGuestEntity(guest);
    model.guestFrozen.set(true);
}

export function unfreezeGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (guest) unfreezeGuestEntity(guest);
    model.guestFrozen.set(false);
}

// ── Accessories ───────────���───────────────────────────��───────────────

export function setAccessory(model: PeepSimModel, type: AccessoryType | null): void {
    const prev = model.accessoryActive.get();
    model.accessoryActive.set(type);

    const guest = getSelectedGuest(model);
    if (!guest) return;

    if (prev) guest.removeItem({ type: prev });

    if (type) {
        guest.giveItem({ type });
        if (COLOUR_ACCESSORIES.has(type)) {
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
    if (type && COLOUR_ACCESSORIES.has(type)) {
        applyAccessoryColour(model, guest, type);
    }
}

function applyAccessoryColour(model: PeepSimModel, guest: Guest, type: string): void {
    const colour = model.accessoryColour.get();
    if (type === AccessoryType.Hat) guest.hatColour = colour;
    if (type === AccessoryType.Balloon) guest.balloonColour = colour;
    if (type === AccessoryType.Umbrella) guest.umbrellaColour = colour;
}

export function enforceAccessories(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    const active = model.accessoryActive.get();
    if (active && !guest.hasItem({ type: active })) {
        guest.giveItem({ type: active });
        if (COLOUR_ACCESSORIES.has(active)) {
            applyAccessoryColour(model, guest, active);
        }
    }
}

export function syncAccessoriesFromGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;

    let foundType: AccessoryType | null = null;
    let foundIndex = 0;
    let foundColour = 0;

    for (let i = 1; i < ACCESSORY_TYPES.length; i++) {
        const type = ACCESSORY_TYPES[i]!;
        if (guest.hasItem({ type })) {
            foundType = type;
            foundIndex = i;
            if (type === AccessoryType.Hat) foundColour = guest.hatColour;
            else if (type === AccessoryType.Balloon) foundColour = guest.balloonColour;
            else if (type === AccessoryType.Umbrella) foundColour = guest.umbrellaColour;
            break;
        }
    }

    if (model.accessoryActive.get() !== foundType) model.accessoryActive.set(foundType);
    if (model.accessoryIndex.get() !== foundIndex) model.accessoryIndex.set(foundIndex);
    if (model.accessoryColour.get() !== foundColour) model.accessoryColour.set(foundColour);
}

export function syncAppearanceFromGuest(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) return;
    const frozen = guest.getFlag("positionFrozen");
    if (model.guestFrozen.get() !== frozen) model.guestFrozen.set(frozen);
    const shirt = guest.tshirtColour;
    if (model.shirtColour.get() !== shirt) model.shirtColour.set(shirt);
    const pants = guest.trousersColour;
    if (model.pantsColour.get() !== pants) model.pantsColour.set(pants);
    syncAccessoriesFromGuest(model);
}

// ── Action animations ──────────���──────────────────────────────────────

export function refreshActionAnimations(model: PeepSimModel): void {
    const guest = getSelectedGuest(model);
    if (!guest) {
        model.actionAnimations.set([]);
        model.actionLabels.set(["(no guest)"]);
        model.queueActionAnimations.set([]);
        model.queueActionLabels.set(["(none)"]);
        return;
    }

    const available: string[] = (guest as any).availableAnimations ?? [];
    const anims: string[] = [];
    const labels: string[] = [];
    for (const anim of available) {
        if (ACTION_EXCLUDE.has(anim)) continue;
        labels.push(ACTION_LABELS[anim] ?? anim);
        anims.push(anim);
    }

    model.actionAnimations.set(anims);
    model.actionLabels.set(labels.length > 0 ? labels : ["(none available)"]);
    model.selectedActionIndex.set(0);

    model.queueActionAnimations.set(anims);
    model.queueActionLabels.set(labels.length > 0 ? labels : ["(none)"]);
    model.selectedQueueActionIndex.set(0);
}

// ── Reset ────────────────────────────────────��────────────────────────

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
    model.bindToGuest(null);
}
