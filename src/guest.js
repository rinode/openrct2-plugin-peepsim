var selectedGuestId = null;
var aiDisabled = true;

var ACCESSORY_TYPES = [null, "hat", "sunglasses", "balloon", "umbrella"];
var COLOUR_ACCESSORIES = { hat: true, balloon: true, umbrella: true };
var DEFAULT_COLOURS = { hat: 6, balloon: 14, umbrella: 0 };

var accessoryState = {
    active: null,
    colour: 0
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

function setAccessory(type) {
    var prev = accessoryState.active;
    accessoryState.active = type;

    var guest = getSelectedGuest();
    if (!guest) return;

    if (prev) {
        guest.removeItem({ type: prev });
    }

    if (type) {
        guest.giveItem({ type: type });
        if (COLOUR_ACCESSORIES[type]) {
            applyAccessoryColour(guest, type);
        }
    }

    freezeGuest();
}

function setAccessoryColour(colour) {
    accessoryState.colour = colour;
    var guest = getSelectedGuest();
    if (!guest) return;
    var type = accessoryState.active;
    if (type && COLOUR_ACCESSORIES[type]) {
        applyAccessoryColour(guest, type);
    }
}

function applyAccessoryColour(guest, type) {
    if (type === "hat") guest.hatColour = accessoryState.colour;
    if (type === "balloon") guest.balloonColour = accessoryState.colour;
    if (type === "umbrella") guest.umbrellaColour = accessoryState.colour;
}

function enforceAccessories() {
    var guest = getSelectedGuest();
    if (!guest) return;

    var active = accessoryState.active;
    if (active && !guest.hasItem({ type: active })) {
        guest.giveItem({ type: active });
        if (COLOUR_ACCESSORIES[active]) {
            applyAccessoryColour(guest, active);
        }
    }
}

function getAccessoryState() {
    return accessoryState;
}

function syncAccessoriesFromGuest() {
    var guest = getSelectedGuest();
    if (!guest) return;

    accessoryState.active = null;
    accessoryState.colour = 0;

    for (var i = 1; i < ACCESSORY_TYPES.length; i++) {
        var type = ACCESSORY_TYPES[i];
        if (guest.hasItem({ type: type })) {
            accessoryState.active = type;
            if (type === "hat") accessoryState.colour = guest.hatColour;
            else if (type === "balloon") accessoryState.colour = guest.balloonColour;
            else if (type === "umbrella") accessoryState.colour = guest.umbrellaColour;
            break;
        }
    }
}

function getSelectedGuestId() {
    return selectedGuestId;
}

function resetState() {
    var guest = getSelectedGuest();
    if (guest) {
        guest.setFlag("positionFrozen", false);
        guest.animation = "walking";
        guest.animationOffset = 0;
    }
    selectedGuestId = null;
    aiDisabled = true;
    accessoryState = {
        active: null,
        colour: 0
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
    setAccessory,
    setAccessoryColour,
    getAccessoryState,
    syncAccessoriesFromGuest,
    enforceAccessories,
    resetState,
    ACCESSORY_TYPES,
    COLOUR_ACCESSORIES,
    DEFAULT_COLOURS
};
