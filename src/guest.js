var selectedGuestId = null;
var aiDisabled = true;

// Accessory slot groups — items in the same group are mutually exclusive
var ACCESSORY_GROUPS = {
    head: ["hat", "sunglasses"],
    held: ["balloon", "umbrella"]
};

// Default colours for accessories (only items with colour support)
var ACCESSORY_COLOURS = {
    hat: 6,
    balloon: 14,
    umbrella: 0
};

// Current state: which item is active per group, and colours
var accessoryState = {
    head: null,     // null = none, or "hat"/"sunglasses"
    held: null,     // null = none, or "balloon"/"umbrella"
    colours: {
        hat: 6,
        balloon: 14,
        umbrella: 0
    }
};

function getSelectedGuest() {
    if (selectedGuestId === null) return null;
    var entity = map.getEntity(selectedGuestId);
    if (!entity || entity.type !== "guest") {
        selectedGuestId = null;
        return null;
    }
    return entity;
}

function selectGuest(id) {
    selectedGuestId = id;
}

function spawnGuest() {
    var guest = park.generateGuest();
    if (guest && guest.id !== null) {
        selectedGuestId = guest.id;
        context.executeAction("guestsetname", { peep: guest.id, name: "PeepSim" }, function () { });
    }
    return guest;
}

function getGuestList() {
    return map.getAllEntities("guest").map(function (g) {
        return { id: g.id, name: g.name };
    });
}

function setAiDisabled(disabled) {
    // AI is always disabled in PeepSim
}

function isAiDisabled() {
    return true;
}

function freezeGuest() {
    var guest = getSelectedGuest();
    if (guest) {
        guest.setFlag("positionFrozen", true);
        guest.animation = "watchRide";
        guest.animationOffset = 0;
    }
}

function unfreezeGuest() {
    var guest = getSelectedGuest();
    if (guest) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }
}

function setAccessoryGroup(group, itemType) {
    // itemType is null (none) or one of the group's items
    var prev = accessoryState[group];
    accessoryState[group] = itemType;

    var guest = getSelectedGuest();
    if (!guest) return;

    // Remove old item from group
    if (prev) {
        guest.removeItem({ type: prev });
    }

    // Give new item
    if (itemType) {
        guest.giveItem({ type: itemType });
        applyAccessoryColour(guest, itemType);
    }
}

function setAccessoryColour(type, colour) {
    accessoryState.colours[type] = colour;
    var guest = getSelectedGuest();
    if (!guest) return;
    applyAccessoryColour(guest, type);
}

function applyAccessoryColour(guest, type) {
    if (type === "hat") guest.hatColour = accessoryState.colours.hat;
    if (type === "balloon") guest.balloonColour = accessoryState.colours.balloon;
    if (type === "umbrella") guest.umbrellaColour = accessoryState.colours.umbrella;
}

function enforceAccessories() {
    var guest = getSelectedGuest();
    if (!guest) return;

    var groups = Object.keys(ACCESSORY_GROUPS);
    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        var active = accessoryState[group];
        if (active && !guest.hasItem({ type: active })) {
            guest.giveItem({ type: active });
            if (accessoryState.colours[active] !== undefined) {
                applyAccessoryColour(guest, active);
            }
        }
    }
}

function getAccessoryState() {
    return accessoryState;
}

function syncAccessoriesFromGuest() {
    var guest = getSelectedGuest();
    if (!guest) return;

    // Sync head group
    if (guest.hasItem({ type: "hat" })) {
        accessoryState.head = "hat";
        accessoryState.colours.hat = guest.hatColour;
    } else if (guest.hasItem({ type: "sunglasses" })) {
        accessoryState.head = "sunglasses";
    } else {
        accessoryState.head = null;
    }

    // Sync held group
    if (guest.hasItem({ type: "balloon" })) {
        accessoryState.held = "balloon";
        accessoryState.colours.balloon = guest.balloonColour;
    } else if (guest.hasItem({ type: "umbrella" })) {
        accessoryState.held = "umbrella";
        accessoryState.colours.umbrella = guest.umbrellaColour;
    } else {
        accessoryState.held = null;
    }
}

function getSelectedGuestId() {
    return selectedGuestId;
}

function resetState() {
    // Unfreeze current guest before clearing
    var guest = getSelectedGuest();
    if (guest) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }
    selectedGuestId = null;
    aiDisabled = true;
    accessoryState = {
        head: null,
        held: null,
        colours: {
            hat: 6,
            balloon: 14,
            umbrella: 0
        }
    };
}

export {
    getSelectedGuest,
    getSelectedGuestId,
    selectGuest,
    spawnGuest,
    getGuestList,
    setAiDisabled,
    isAiDisabled,
    freezeGuest,
    unfreezeGuest,
    setAccessoryGroup,
    setAccessoryColour,
    getAccessoryState,
    syncAccessoriesFromGuest,
    enforceAccessories,
    resetState,
    ACCESSORY_GROUPS
};
