var selectedGuestId = null;
var aiDisabled = true;

var accessories = {
    hat: { enabled: false, colour: 6 },
    balloon: { enabled: false, colour: 14 },
    umbrella: { enabled: false, colour: 0 },
    sunglasses: { enabled: false }
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

function setAccessory(type, enabled) {
    accessories[type].enabled = enabled;
    var guest = getSelectedGuest();
    if (!guest) return;

    if (enabled) {
        guest.giveItem({ type: type });
        applyAccessoryColour(guest, type);
    } else {
        guest.removeItem({ type: type });
    }
}

function setAccessoryColour(type, colour) {
    accessories[type].colour = colour;
    var guest = getSelectedGuest();
    if (!guest) return;
    applyAccessoryColour(guest, type);
}

function applyAccessoryColour(guest, type) {
    if (type === "hat") guest.hatColour = accessories.hat.colour;
    if (type === "balloon") guest.balloonColour = accessories.balloon.colour;
    if (type === "umbrella") guest.umbrellaColour = accessories.umbrella.colour;
}

function enforceAccessories() {
    var guest = getSelectedGuest();
    if (!guest) return;

    var types = ["hat", "balloon", "umbrella", "sunglasses"];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (accessories[type].enabled && !guest.hasItem({ type: type })) {
            guest.giveItem({ type: type });
            if (type !== "sunglasses") {
                applyAccessoryColour(guest, type);
            }
        }
    }
}

function getAccessories() {
    return accessories;
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
    accessories = {
        hat: { enabled: false, colour: 6 },
        balloon: { enabled: false, colour: 14 },
        umbrella: { enabled: false, colour: 0 },
        sunglasses: { enabled: false }
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
    getAccessories,
    enforceAccessories,
    resetState
};
