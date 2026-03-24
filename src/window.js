import {
    getSelectedGuest,
    getSelectedGuestId,
    selectGuest,
    spawnGuest,
    getGuestList,
    freezeGuest,
    unfreezeGuest,
    setAccessory,
    setAccessoryColour,
    getAccessories,
    enforceAccessories,
    resetState
} from "./guest";
import {
    addAction,
    removeAction,
    clearActions,
    getActions,
    hasWork,
    startExecutor,
    stopExecutor,
    clearHighlight,
    setControlMode,
    getControlMode,
    directMove,
    directMoveDirection,
    directWalk
} from "./actions";

var WINDOW_CLASS = "peepsim-main";
var WINDOW_WIDTH = 300;
var WINDOW_HEIGHT = 400;
var MARGIN = 5;

function openWindow() {
    var existing = ui.getWindow(WINDOW_CLASS);
    if (existing) {
        existing.bringToFront();
        return;
    }

    startExecutor();

    ui.openWindow({
        classification: WINDOW_CLASS,
        title: "PeepSim",
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        minWidth: WINDOW_WIDTH,
        maxWidth: WINDOW_WIDTH,
        minHeight: WINDOW_HEIGHT,
        maxHeight: WINDOW_HEIGHT,
        tabs: [
            createControlTab(),
            createAppearanceTab(),
            createQueueTab()
        ],
        tabIndex: 0,
        onUpdate: function () {
            updateControlTab();
            updateAppearanceTab();
            updateQueueTab();
            enforceAccessories();
        },
        onClose: function () {
            stopDirectionTool();
            if (actionPlayInterval !== null) {
                context.clearInterval(actionPlayInterval);
                actionPlayInterval = null;
            }
            if (ui.tool) {
                ui.tool.cancel();
            }
            stopExecutor();
            clearActions();
            clearHighlight();
            resetState();
        }
    });
}

// Sprite IDs for directional arrows (from maze construction)
var SPR_DIR_NE = 5635;
var SPR_DIR_SE = 5636;
var SPR_DIR_SW = 5637;
var SPR_DIR_NW = 5638;

// Direction tool state
var heldDirection = -1;
var directionInterval = null;

function startDirectionTool(direction) {
    if (!getSelectedGuest()) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }

    // If already holding this direction, toggle off
    if (heldDirection === direction) {
        stopDirectionTool();
        freezeGuest();
        return;
    }

    // Stop any previous direction hold
    if (directionInterval !== null) {
        context.clearInterval(directionInterval);
        directionInterval = null;
    }

    heldDirection = direction;

    // Start walking immediately
    directWalk(direction);

    // Keep re-pointing destination ahead every 400ms
    directionInterval = context.setInterval(function () {
        if (heldDirection < 0) return;
        directWalk(heldDirection);
    }, 400);

    // Update button visuals
    updateArrowPressed();
}

function stopDirectionTool() {
    var wasActive = heldDirection >= 0;
    heldDirection = -1;
    if (directionInterval !== null) {
        context.clearInterval(directionInterval);
        directionInterval = null;
    }
    updateArrowPressed();
    return wasActive;
}

function updateArrowPressed() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var dirs = [
        { name: "btnDirNE", dir: 0 },
        { name: "btnDirSE", dir: 1 },
        { name: "btnDirSW", dir: 2 },
        { name: "btnDirNW", dir: 3 }
    ];
    for (var i = 0; i < dirs.length; i++) {
        try {
            var btn = win.findWidget(dirs[i].name);
            btn.isPressed = (heldDirection === dirs[i].dir);
        } catch (e) { }
    }
}

// ==================== CONTROL TAB ==

function createControlTab() {
    return {
        image: "guests",
        widgets: [
            // Guest selection dropdown
            {
                type: "label",
                x: MARGIN,
                y: 50,
                width: 60,
                height: 14,
                name: "lblGuest",
                text: "Guest:"
            },
            {
                type: "dropdown",
                x: 60,
                y: 48,
                width: 170,
                height: 14,
                name: "ddGuest",
                items: ["(none)"],
                selectedIndex: 0,
                onChange: function (index) {
                    resetState();
                    clearActions();
                    var list = getGuestList();
                    if (index > 0 && index <= list.length) {
                        selectGuest(list[index - 1].id);
                        freezeGuest();
                        refreshActionDropdown();
                    }
                }
            },
            // Refresh button
            {
                type: "button",
                x: 235,
                y: 48,
                width: 24,
                height: 14,
                name: "btnRefresh",
                text: "R",
                tooltip: "Refresh guest list",
                onClick: function () {
                    refreshGuestDropdown();
                }
            },
            // Spawn button
            {
                type: "button",
                x: 262,
                y: 48,
                width: 30,
                height: 14,
                name: "btnSpawn",
                text: "New",
                tooltip: "Spawn a new guest",
                onClick: function () {
                    spawnGuest();
                    freezeGuest();
                    refreshGuestDropdown();
                    refreshActionDropdown();
                }
            },
            // Mode selector
            {
                type: "label",
                x: MARGIN,
                y: 70,
                width: 50,
                height: 14,
                name: "lblMode",
                text: "Mode:"
            },
            {
                type: "dropdown",
                x: 60,
                y: 68,
                width: 120,
                height: 14,
                name: "ddMode",
                items: ["Direct Control", "Queued Control"],
                selectedIndex: 0,
                onChange: function (index) {
                    var mode = index === 0 ? "direct" : "queued";
                    setControlMode(mode);
                    updateDirectWidgets();
                }
            },
            // Viewport
            {
                type: "viewport",
                x: MARGIN,
                y: 88,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 150,
                name: "vpGuest"
            },
            // Guest info
            {
                type: "label",
                x: MARGIN,
                y: 244,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 14,
                name: "lblInfo",
                text: "No guest selected"
            },
            // Move To button (both modes)
            {
                type: "button",
                x: MARGIN,
                y: 262,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 24,
                name: "btnMoveTo",
                text: "Move To",
                tooltip: "Click a tile to walk the guest there",
                onClick: function () {
                    activateMoveTool();
                }
            },
            // --- Directional arrows (direct mode only) ---
            // NW arrow (top-left)
            {
                type: "button",
                x: 105,
                y: 292,
                width: 45,
                height: 29,
                name: "btnDirNW",
                image: SPR_DIR_NW,
                onClick: function () {
                    startDirectionTool(3);
                }
            },
            // NE arrow (top-right)
            {
                type: "button",
                x: 150,
                y: 292,
                width: 45,
                height: 29,
                name: "btnDirNE",
                image: SPR_DIR_NE,
                onClick: function () {
                    startDirectionTool(0);
                }
            },
            // SW arrow (bottom-left)
            {
                type: "button",
                x: 105,
                y: 321,
                width: 45,
                height: 29,
                name: "btnDirSW",
                image: SPR_DIR_SW,
                onClick: function () {
                    startDirectionTool(2);
                }
            },
            // SE arrow (bottom-right)
            {
                type: "button",
                x: 150,
                y: 321,
                width: 45,
                height: 29,
                name: "btnDirSE",
                image: SPR_DIR_SE,
                onClick: function () {
                    startDirectionTool(1);
                }
            },
            // Idle button (beneath arrows)
            {
                type: "button",
                x: 105,
                y: 354,
                width: 90,
                height: 20,
                name: "btnIdle",
                text: "Idle",
                tooltip: "Toggle guest idle",
                onClick: function () {
                    var guest = getSelectedGuest();
                    if (!guest) return;
                    var wasWalking = stopDirectionTool();
                    if (wasWalking) {
                        freezeGuest();
                    } else if (guest.getFlag("positionFrozen")) {
                        unfreezeGuest();
                    } else {
                        freezeGuest();
                    }
                }
            },
            // Action dropdown + perform button
            {
                type: "dropdown",
                x: MARGIN,
                y: 380,
                width: 220,
                height: 14,
                name: "ddAction",
                items: ["(select action)"],
                selectedIndex: 0
            },
            {
                type: "button",
                x: 230,
                y: 379,
                width: 60,
                height: 16,
                name: "btnPerform",
                text: "Perform",
                tooltip: "Perform the selected action",
                onClick: function () {
                    performSelectedAction();
                }
            }
        ]
    };
}

function updateDirectWidgets() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;

    var isDirect = getControlMode() === "direct";
    var arrowNames = ["btnDirNW", "btnDirNE", "btnDirSW", "btnDirSE"];
    for (var i = 0; i < arrowNames.length; i++) {
        try {
            var btn = win.findWidget(arrowNames[i]);
            btn.isVisible = isDirect;
        } catch (e) { }
    }

    // Idle button visibility and state
    try {
        var btnIdle = win.findWidget("btnIdle");
        btnIdle.isVisible = isDirect;
        var guest = getSelectedGuest();
        if (guest) {
            btnIdle.isPressed = guest.getFlag("positionFrozen");
        }
    } catch (e) { }

    // Action dropdown + perform button visibility and enabled state
    try {
        var ddAction = win.findWidget("ddAction");
        var btnPerform = win.findWidget("btnPerform");
        ddAction.isVisible = isDirect;
        btnPerform.isVisible = isDirect;
        var guest = getSelectedGuest();
        var isIdle = guest && guest.getFlag("positionFrozen");
        ddAction.isDisabled = !isIdle;
        btnPerform.isDisabled = !isIdle;
    } catch (e) { }
}

// Nice display names for animations
var ACTION_LABELS = {
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

// Animations to exclude from the dropdown (boring/internal)
var ACTION_EXCLUDE = [
    "walking", "watchRide", "holdMat",
    "sittingIdle", "sittingEatFood",
    "sittingLookAroundLeft", "sittingLookAroundRight",
    "hanging", "drowning"
];

var actionAnimations = []; // mapped list for current guest

function refreshActionDropdown() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;

    var dd = win.findWidget("ddAction");
    var guest = getSelectedGuest();
    actionAnimations = [];

    if (!guest) {
        dd.items = ["(no guest)"];
        dd.selectedIndex = 0;
        return;
    }

    var available = guest.availableAnimations || [];
    var items = [];
    for (var i = 0; i < available.length; i++) {
        var anim = available[i];
        if (ACTION_EXCLUDE.indexOf(anim) >= 0) continue;
        var label = ACTION_LABELS[anim] || anim;
        items.push(label);
        actionAnimations.push(anim);
    }

    if (items.length === 0) {
        dd.items = ["(none available)"];
    } else {
        dd.items = items;
    }
    dd.selectedIndex = 0;
}

var actionPlayInterval = null;

function performSelectedAction() {
    var guest = getSelectedGuest();
    if (!guest) return;
    if (actionAnimations.length === 0) return;
    if (!guest.getFlag("positionFrozen")) return;

    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;

    var dd = win.findWidget("ddAction");
    var idx = dd.selectedIndex;
    if (idx < 0 || idx >= actionAnimations.length) return;

    var anim = actionAnimations[idx];

    // Stop any previous animation playback
    if (actionPlayInterval !== null) {
        context.clearInterval(actionPlayInterval);
        actionPlayInterval = null;
    }

    guest.animation = anim;
    guest.animationOffset = 0;

    var prevOffset = -1;
    actionPlayInterval = context.setInterval(function () {
        var g = getSelectedGuest();
        if (!g || g.animation !== anim) {
            // Animation was changed externally, stop tracking
            if (actionPlayInterval !== null) {
                context.clearInterval(actionPlayInterval);
                actionPlayInterval = null;
            }
            return;
        }
        var offset = g.animationOffset;
        // Detect wrap-around: offset went backwards means animation completed
        if (prevOffset >= 0 && offset < prevOffset) {
            g.animation = "watchRide";
            g.animationOffset = 0;
            context.clearInterval(actionPlayInterval);
            actionPlayInterval = null;
            return;
        }
        prevOffset = offset;
    }, 50);
}

function refreshGuestDropdown() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var dd = win.findWidget("ddGuest");
    var list = getGuestList();
    var items = ["(none)"];
    var selectedIndex = 0;
    var currentId = getSelectedGuestId();
    for (var i = 0; i < list.length; i++) {
        items.push(list[i].name + " (#" + list[i].id + ")");
        if (list[i].id === currentId) {
            selectedIndex = i + 1;
        }
    }
    dd.items = items;
    dd.selectedIndex = selectedIndex;
}

function updateControlTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 0) return;

    // Sync mode dropdown
    var ddMode = win.findWidget("ddMode");
    var modeIndex = getControlMode() === "direct" ? 0 : 1;
    if (ddMode.selectedIndex !== modeIndex) {
        ddMode.selectedIndex = modeIndex;
    }

    // Sync arrow visibility
    updateDirectWidgets();

    var guest = getSelectedGuest();
    var lblInfo = win.findWidget("lblInfo");

    if (guest) {
        lblInfo.text = guest.name
            + " | HP:" + guest.happiness
            + " HG:" + guest.hunger
            + " TH:" + guest.thirst
            + " $" + (guest.cash / 10).toFixed(1);

        var vp = win.findWidget("vpGuest");
        if (vp && vp.viewport) {
            vp.viewport.moveTo({ x: guest.x, y: guest.y, z: guest.z });
        }
    } else {
        lblInfo.text = "No guest selected";
    }
}

function activateMoveTool() {
    if (!getSelectedGuest()) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }
    // Stop any active direction hold
    stopDirectionTool();
    ui.activateTool({
        id: "peepsim-move",
        cursor: "walk_down",
        filter: ["terrain"],
        onMove: function (e) {
            if (e.mapCoords) {
                ui.tileSelection.tiles = [{ x: e.mapCoords.x, y: e.mapCoords.y }];
            }
        },
        onDown: function (e) {
            if (e.mapCoords) {
                var tileX = Math.floor(e.mapCoords.x / 32);
                var tileY = Math.floor(e.mapCoords.y / 32);
                if (getControlMode() === "direct") {
                    directMove(tileX, tileY);
                } else {
                    addAction({ type: "move", target: { x: tileX, y: tileY } });
                    refreshQueueList();
                }
            }
        },
        onFinish: function () {
            clearHighlight();
        }
    });
}

// ==================== APPEARANCE TAB ====================

function createAppearanceTab() {
    return {
        image: "ride",
        widgets: [
            // Shirt colour
            {
                type: "label",
                x: MARGIN,
                y: 50,
                width: 80,
                height: 14,
                name: "lblShirt",
                text: "Shirt colour:"
            },
            {
                type: "colourpicker",
                x: 100,
                y: 48,
                width: 12,
                height: 12,
                name: "cpShirt",
                colour: 0,
                onChange: function (colour) {
                    var guest = getSelectedGuest();
                    if (guest) guest.tshirtColour = colour;
                }
            },
            // Pants colour
            {
                type: "label",
                x: MARGIN,
                y: 70,
                width: 80,
                height: 14,
                name: "lblPants",
                text: "Pants colour:"
            },
            {
                type: "colourpicker",
                x: 100,
                y: 68,
                width: 12,
                height: 12,
                name: "cpPants",
                colour: 0,
                onChange: function (colour) {
                    var guest = getSelectedGuest();
                    if (guest) guest.trousersColour = colour;
                }
            },
            // --- Accessories ---
            {
                type: "groupbox",
                x: MARGIN,
                y: 90,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 130,
                name: "gbAccessories",
                text: "Accessories"
            },
            // Hat
            {
                type: "checkbox",
                x: MARGIN + 5,
                y: 108,
                width: 80,
                height: 14,
                name: "chkHat",
                text: "Hat",
                isChecked: false,
                onChange: function (checked) {
                    setAccessory("hat", checked);
                }
            },
            {
                type: "colourpicker",
                x: 100,
                y: 106,
                width: 12,
                height: 12,
                name: "cpHat",
                colour: 6,
                onChange: function (colour) {
                    setAccessoryColour("hat", colour);
                }
            },
            // Balloon
            {
                type: "checkbox",
                x: MARGIN + 5,
                y: 128,
                width: 80,
                height: 14,
                name: "chkBalloon",
                text: "Balloon",
                isChecked: false,
                onChange: function (checked) {
                    setAccessory("balloon", checked);
                }
            },
            {
                type: "colourpicker",
                x: 100,
                y: 126,
                width: 12,
                height: 12,
                name: "cpBalloon",
                colour: 14,
                onChange: function (colour) {
                    setAccessoryColour("balloon", colour);
                }
            },
            // Umbrella
            {
                type: "checkbox",
                x: MARGIN + 5,
                y: 148,
                width: 80,
                height: 14,
                name: "chkUmbrella",
                text: "Umbrella",
                isChecked: false,
                onChange: function (checked) {
                    setAccessory("umbrella", checked);
                }
            },
            {
                type: "colourpicker",
                x: 100,
                y: 146,
                width: 12,
                height: 12,
                name: "cpUmbrella",
                colour: 0,
                onChange: function (colour) {
                    setAccessoryColour("umbrella", colour);
                }
            },
            // Sunglasses
            {
                type: "checkbox",
                x: MARGIN + 5,
                y: 168,
                width: 80,
                height: 14,
                name: "chkSunglasses",
                text: "Sunglasses",
                isChecked: false,
                onChange: function (checked) {
                    setAccessory("sunglasses", checked);
                }
            }
        ]
    };
}

function updateAppearanceTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 1) return;

    var guest = getSelectedGuest();
    if (!guest) return;

    var cpShirt = win.findWidget("cpShirt");
    var cpPants = win.findWidget("cpPants");
    var cpHat = win.findWidget("cpHat");
    var cpBalloon = win.findWidget("cpBalloon");
    var cpUmbrella = win.findWidget("cpUmbrella");
    var chkHat = win.findWidget("chkHat");
    var chkBalloon = win.findWidget("chkBalloon");
    var chkUmbrella = win.findWidget("chkUmbrella");
    var chkSunglasses = win.findWidget("chkSunglasses");

    cpShirt.colour = guest.tshirtColour;
    cpPants.colour = guest.trousersColour;
    cpHat.colour = guest.hatColour;
    cpBalloon.colour = guest.balloonColour;
    cpUmbrella.colour = guest.umbrellaColour;

    chkHat.isChecked = guest.hasItem({ type: "hat" });
    chkBalloon.isChecked = guest.hasItem({ type: "balloon" });
    chkUmbrella.isChecked = guest.hasItem({ type: "umbrella" });
    chkSunglasses.isChecked = guest.hasItem({ type: "sunglasses" });
}

// ==================== QUEUE TAB ====================

function createQueueTab() {
    return {
        image: "map",
        widgets: [
            {
                type: "label",
                x: MARGIN,
                y: 50,
                width: 200,
                height: 14,
                name: "lblQueue",
                text: "Action Queue"
            },
            {
                type: "listview",
                x: MARGIN,
                y: 66,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 250,
                name: "lvQueue",
                scrollbars: "vertical",
                isStriped: true,
                showColumnHeaders: true,
                columns: [
                    { header: "#", width: 30 },
                    { header: "Target", width: 120 }
                ],
                items: [],
                canSelect: true
            },
            // Delete button
            {
                type: "button",
                x: MARGIN,
                y: 322,
                width: 90,
                height: 20,
                name: "btnDelete",
                text: "Delete",
                onClick: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var lv = win.findWidget("lvQueue");
                    if (lv.selectedCell && lv.selectedCell.row >= 0) {
                        removeAction(lv.selectedCell.row);
                        refreshQueueList();
                    }
                }
            },
            // Clear all button
            {
                type: "button",
                x: 100,
                y: 322,
                width: 90,
                height: 20,
                name: "btnClearAll",
                text: "Clear All",
                onClick: function () {
                    clearActions();
                    refreshQueueList();
                }
            },
            // Move To (from queue tab)
            {
                type: "button",
                x: MARGIN,
                y: 348,
                width: 185,
                height: 20,
                name: "btnQueueMove",
                text: "+ Move To",
                onClick: function () {
                    activateMoveTool();
                }
            }
        ]
    };
}

function updateQueueTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 2) return;
    refreshQueueList();
}

function refreshQueueList() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var lv = win.findWidget("lvQueue");
    var actions = getActions();
    var items = [];
    for (var i = 0; i < actions.length; i++) {
        var a = actions[i];
        items.push([
            String(i + 1),
            a.target.x + ", " + a.target.y
        ]);
    }
    lv.items = items;
}

export { openWindow };
