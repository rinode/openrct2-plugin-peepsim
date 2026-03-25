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
    getAccessoryState,
    syncAccessoriesFromGuest,
    enforceAccessories,
    resetState,
    ACCESSORY_TYPES,
    COLOUR_ACCESSORIES,
    DEFAULT_COLOURS
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
    directWalk,
    pauseQueue,
    resumeQueue,
    isQueuePaused
} from "./actions";

var WINDOW_CLASS = "peepsim-main";
var WINDOW_WIDTH = 300;
var WINDOW_HEIGHT = 460;
var MARGIN = 5;
var VP_WIDTH = WINDOW_WIDTH - MARGIN * 2;
var VP_HEIGHT = Math.round(VP_WIDTH * 9 / 16);
var VP_BOTTOM = 50 + VP_HEIGHT;

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
        onTabChange: function () {
            updateControlTab();
            updateAppearanceTab();
            updateQueueTab();
        },
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

var SPR_DIR_NE = 5635;
var SPR_DIR_SE = 5636;
var SPR_DIR_SW = 5637;
var SPR_DIR_NW = 5638;

var heldDirection = -1;
var directionInterval = null;

function startDirectionTool(direction) {
    if (!getSelectedGuest()) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }

    if (heldDirection === direction) {
        stopDirectionTool();
        freezeGuest();
        return;
    }

    if (directionInterval !== null) {
        context.clearInterval(directionInterval);
        directionInterval = null;
    }

    heldDirection = direction;
    directWalk(direction);

    directionInterval = context.setInterval(function () {
        if (heldDirection < 0) return;
        directWalk(heldDirection);
    }, 400);

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
    if (!win || win.tabIndex !== 0) return;
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

var SPR_PAUSE = 5597;
var SPR_PAUSE_PRESSED = 5598;

function createControlTab() {
    var Y_GUEST = VP_BOTTOM + 4;
    var Y_MODE  = Y_GUEST + 18;
    var Y_MOVE  = Y_MODE + 20;
    var Y_ARROWS = Y_MOVE + 24;
    var Y_ARROWS2 = Y_ARROWS + 29;
    var Y_IDLE  = Y_ARROWS2 + 29;
    var Y_ACTION = Y_IDLE + 28;
    var Y_QADD  = Y_ACTION + 20;
    var Y_QPLAY = Y_QADD + 20;

    return {
        image: "guests",
        widgets: [
            {
                type: "viewport",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpGuest"
            },
            {
                type: "label",
                x: MARGIN,
                y: Y_GUEST,
                width: 50,
                height: 14,
                name: "lblGuest",
                text: "Guest:"
            },
            {
                type: "dropdown",
                x: 50,
                y: Y_GUEST - 2,
                width: 140,
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
                        syncAccessoriesFromGuest();
                        refreshActionDropdown();
                        refreshQueueActionDropdown();
                    }
                }
            },
            {
                type: "button",
                x: 195,
                y: Y_GUEST - 2,
                width: 50,
                height: 14,
                name: "btnRefresh",
                text: "Refresh",
                onClick: function () {
                    refreshGuestDropdown();
                }
            },
            {
                type: "button",
                x: 250,
                y: Y_GUEST - 2,
                width: 42,
                height: 14,
                name: "btnSpawn",
                text: "New",
                tooltip: "Spawn a new guest",
                onClick: function () {
                    spawnGuest();
                    freezeGuest();
                    syncAccessoriesFromGuest();
                    refreshGuestDropdown();
                    refreshActionDropdown();
                    refreshQueueActionDropdown();
                }
            },
            {
                type: "label",
                x: MARGIN,
                y: Y_MODE,
                width: 50,
                height: 14,
                name: "lblMode",
                text: "Mode:"
            },
            {
                type: "dropdown",
                x: 50,
                y: Y_MODE - 2,
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
            {
                type: "button",
                x: MARGIN,
                y: Y_MOVE,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 20,
                name: "btnMoveTo",
                text: "Move To",
                tooltip: "Click a tile to walk the guest there",
                onClick: function () {
                    activateMoveTool();
                }
            },
            {
                type: "button",
                x: 105,
                y: Y_ARROWS,
                width: 45,
                height: 29,
                name: "btnDirNW",
                image: SPR_DIR_NW,
                onClick: function () {
                    startDirectionTool(3);
                }
            },
            {
                type: "button",
                x: 150,
                y: Y_ARROWS,
                width: 45,
                height: 29,
                name: "btnDirNE",
                image: SPR_DIR_NE,
                onClick: function () {
                    startDirectionTool(0);
                }
            },
            {
                type: "button",
                x: 105,
                y: Y_ARROWS2,
                width: 45,
                height: 29,
                name: "btnDirSW",
                image: SPR_DIR_SW,
                onClick: function () {
                    startDirectionTool(2);
                }
            },
            {
                type: "button",
                x: 150,
                y: Y_ARROWS2,
                width: 45,
                height: 29,
                name: "btnDirSE",
                image: SPR_DIR_SE,
                onClick: function () {
                    startDirectionTool(1);
                }
            },
            {
                type: "button",
                x: 138,
                y: Y_IDLE,
                width: 24,
                height: 24,
                name: "btnIdle",
                image: SPR_PAUSE,
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
            {
                type: "dropdown",
                x: MARGIN,
                y: Y_ACTION,
                width: 220,
                height: 14,
                name: "ddAction",
                items: ["(select action)"],
                selectedIndex: 0
            },
            {
                type: "button",
                x: 230,
                y: Y_ACTION - 1,
                width: 60,
                height: 16,
                name: "btnPerform",
                text: "Perform",
                tooltip: "Perform the selected action",
                onClick: function () {
                    performSelectedAction();
                }
            },
            {
                type: "dropdown",
                x: MARGIN,
                y: Y_QADD,
                width: 130,
                height: 14,
                name: "ddCtrlQueueAction",
                items: [],
                selectedIndex: 0
            },
            {
                type: "label",
                x: 140,
                y: Y_QADD,
                width: 20,
                height: 14,
                name: "lblCtrlDuration",
                text: "for"
            },
            {
                type: "spinner",
                x: 160,
                y: Y_QADD - 2,
                width: 55,
                height: 16,
                name: "spnCtrlDuration",
                text: "3s",
                onDecrement: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var spn = win.findWidget("spnCtrlDuration");
                    var val = parseInt(spn.text) || 3;
                    if (val > 1) val--;
                    spn.text = val + "s";
                },
                onIncrement: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var spn = win.findWidget("spnCtrlDuration");
                    var val = parseInt(spn.text) || 3;
                    if (val < 60) val++;
                    spn.text = val + "s";
                }
            },
            {
                type: "button",
                x: 220,
                y: Y_QADD - 2,
                width: 50,
                height: 18,
                name: "btnCtrlAddAction",
                text: "+ Add",
                onClick: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var dd = win.findWidget("ddCtrlQueueAction");
                    var spn = win.findWidget("spnCtrlDuration");
                    if (!queueActionAnimations.length) return;
                    var anim = queueActionAnimations[dd.selectedIndex];
                    var dur = parseInt(spn.text) || 3;
                    addAction({ type: "action", animation: anim, duration: dur });
                    refreshQueueList();
                }
            },
            {
                type: "button",
                x: 272,
                y: Y_QADD - 2,
                width: 18,
                height: 18,
                name: "btnCtrlPlayPause",
                image: SPR_PAUSE,
                tooltip: "Play/Pause queue",
                onClick: function () {
                    if (isQueuePaused()) {
                        resumeQueue();
                    } else {
                        pauseQueue();
                    }
                }
            }
        ]
    };
}

function updateDirectWidgets() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;

    var isDirect = getControlMode() === "direct";
    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    var arrowNames = ["btnDirNW", "btnDirNE", "btnDirSW", "btnDirSE"];
    for (var i = 0; i < arrowNames.length; i++) {
        try {
            var btn = win.findWidget(arrowNames[i]);
            btn.isVisible = isDirect;
        } catch (e) { }
    }

    try {
        var btnIdle = win.findWidget("btnIdle");
        btnIdle.isVisible = isDirect;
        if (guest) {
            var frozen = guest.getFlag("positionFrozen");
            btnIdle.image = frozen ? SPR_PAUSE_PRESSED : SPR_PAUSE;
        }
    } catch (e) { }

    try {
        var ddAction = win.findWidget("ddAction");
        var btnPerform = win.findWidget("btnPerform");
        ddAction.isVisible = isDirect;
        btnPerform.isVisible = isDirect;
        var isIdle = guest && guest.getFlag("positionFrozen");
        ddAction.isDisabled = !hasGuest || !isIdle;
        btnPerform.isDisabled = !hasGuest || !isIdle;
    } catch (e) { }

    var Y_QUEUE_UP = VP_BOTTOM + 66;
    var queuedPositions = [
        { name: "ddCtrlQueueAction", y: Y_QUEUE_UP },
        { name: "lblCtrlDuration", y: Y_QUEUE_UP },
        { name: "spnCtrlDuration", y: Y_QUEUE_UP - 2 },
        { name: "btnCtrlAddAction", y: Y_QUEUE_UP - 2 },
        { name: "btnCtrlPlayPause", y: Y_QUEUE_UP - 2 }
    ];
    for (var j = 0; j < queuedPositions.length; j++) {
        try {
            var w = win.findWidget(queuedPositions[j].name);
            w.isVisible = !isDirect;
            w.isDisabled = !hasGuest;
            if (!isDirect) w.y = queuedPositions[j].y;
        } catch (e) { }
    }

    try {
        var btnPP = win.findWidget("btnCtrlPlayPause");
        var playing = hasGuest && !isQueuePaused();
        btnPP.image = playing ? SPR_PAUSE : SPR_PAUSE_PRESSED;
    } catch (e) { }

    if (!isDirect) {
        refreshCtrlQueueActionDropdown();
    }
}

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

var ACTION_EXCLUDE = [
    "walking", "watchRide", "holdMat",
    "sittingIdle", "sittingEatFood",
    "sittingLookAroundLeft", "sittingLookAroundRight",
    "hanging", "drowning"
];

var actionAnimations = [];

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

function refreshCtrlQueueActionDropdown() {
    populateQueueAnimations();
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var dd;
    try { dd = win.findWidget("ddCtrlQueueAction"); } catch (e) { return; }
    var labels = [];
    for (var j = 0; j < queueActionAnimations.length; j++) {
        labels.push(ACTION_LABELS[queueActionAnimations[j]] || queueActionAnimations[j]);
    }
    dd.items = labels.length > 0 ? labels : ["(none)"];
    if (labels.length > 0) dd.selectedIndex = 0;
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
            if (actionPlayInterval !== null) {
                context.clearInterval(actionPlayInterval);
                actionPlayInterval = null;
            }
            return;
        }
        var offset = g.animationOffset;
        // Offset going backwards means the animation looped
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

    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    var ddMode = win.findWidget("ddMode");
    var modeIndex = getControlMode() === "direct" ? 0 : 1;
    if (ddMode.selectedIndex !== modeIndex) {
        ddMode.selectedIndex = modeIndex;
    }
    ddMode.isDisabled = !hasGuest;

    var disableNames = ["btnMoveTo", "btnDirNW", "btnDirNE", "btnDirSW", "btnDirSE", "btnIdle", "ddAction", "btnPerform"];
    for (var i = 0; i < disableNames.length; i++) {
        try {
            win.findWidget(disableNames[i]).isDisabled = !hasGuest;
        } catch (e) { }
    }

    updateDirectWidgets();

    updateArrowPressed();

    if (guest) {
        var vp = win.findWidget("vpGuest");
        if (vp && vp.viewport) {
            vp.viewport.moveTo({ x: guest.x, y: guest.y, z: guest.z });
        }
    }
}

function activateMoveTool() {
    if (!getSelectedGuest()) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }
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

var ACCESSORY_LABELS = ["None", "Hat", "Sunglasses", "Balloon", "Umbrella"];

function createAppearanceTab() {
    var Y0 = VP_BOTTOM + 4;

    return {
        image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
        widgets: [
            {
                type: "viewport",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpPreview"
            },
            {
                type: "label",
                x: MARGIN,
                y: Y0,
                width: 80,
                height: 14,
                name: "lblShirt",
                text: "Shirt colour:"
            },
            {
                type: "colourpicker",
                x: 100,
                y: Y0 - 2,
                width: 12,
                height: 12,
                name: "cpShirt",
                colour: 0,
                onChange: function (colour) {
                    var guest = getSelectedGuest();
                    if (guest) guest.tshirtColour = colour;
                }
            },
            {
                type: "label",
                x: MARGIN,
                y: Y0 + 20,
                width: 80,
                height: 14,
                name: "lblPants",
                text: "Pants colour:"
            },
            {
                type: "colourpicker",
                x: 100,
                y: Y0 + 18,
                width: 12,
                height: 12,
                name: "cpPants",
                colour: 0,
                onChange: function (colour) {
                    var guest = getSelectedGuest();
                    if (guest) guest.trousersColour = colour;
                }
            },
            {
                type: "label",
                x: MARGIN,
                y: Y0 + 44,
                width: 80,
                height: 14,
                name: "lblAccessory",
                text: "Accessory:"
            },
            {
                type: "dropdown",
                x: 100,
                y: Y0 + 42,
                width: 110,
                height: 14,
                name: "ddAccessory",
                items: ACCESSORY_LABELS,
                selectedIndex: 0,
                onChange: function (index) {
                    var type = ACCESSORY_TYPES[index];
                    if (type && COLOUR_ACCESSORIES[type]) {
                        setAccessory(type);
                        var win = ui.getWindow(WINDOW_CLASS);
                        if (win) {
                            var cp = win.findWidget("cpAccessory");
                            cp.colour = DEFAULT_COLOURS[type];
                            setAccessoryColour(DEFAULT_COLOURS[type]);
                        }
                    } else {
                        setAccessory(type);
                    }
                }
            },
            {
                type: "colourpicker",
                x: 220,
                y: Y0 + 42,
                width: 12,
                height: 12,
                name: "cpAccessory",
                colour: 0,
                onChange: function (colour) {
                    setAccessoryColour(colour);
                }
            }
        ]
    };
}

function updateAppearanceTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 1) return;

    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    var disableNames = ["cpShirt", "cpPants", "ddAccessory", "cpAccessory"];
    for (var i = 0; i < disableNames.length; i++) {
        try {
            win.findWidget(disableNames[i]).isDisabled = !hasGuest;
        } catch (e) { }
    }

    if (!guest) return;

    var vpPreview = win.findWidget("vpPreview");
    if (vpPreview && vpPreview.viewport) {
        vpPreview.viewport.moveTo({ x: guest.x, y: guest.y, z: guest.z });
    }

    win.findWidget("cpShirt").colour = guest.tshirtColour;
    win.findWidget("cpPants").colour = guest.trousersColour;

    var state = getAccessoryState();
    var ddAccessory = win.findWidget("ddAccessory");
    var accIdx = ACCESSORY_TYPES.indexOf(state.active);
    if (accIdx < 0) accIdx = 0;
    ddAccessory.selectedIndex = accIdx;

    var cpAccessory = win.findWidget("cpAccessory");
    cpAccessory.isDisabled = !state.active || !COLOUR_ACCESSORIES[state.active];
    if (state.active && COLOUR_ACCESSORIES[state.active]) {
        cpAccessory.colour = state.colour;
    }
}

var queueActionAnimations = [];

function populateQueueAnimations() {
    var guest = getSelectedGuest();
    queueActionAnimations = [];
    if (guest) {
        var avail = guest.availableAnimations || [];
        for (var i = 0; i < avail.length; i++) {
            if (ACTION_EXCLUDE.indexOf(avail[i]) === -1) {
                queueActionAnimations.push(avail[i]);
            }
        }
    }
}

function refreshQueueActionDropdown() {
    populateQueueAnimations();
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var dd = win.findWidget("ddQueueAction");
    if (dd) {
        var labels = [];
        for (var j = 0; j < queueActionAnimations.length; j++) {
            labels.push(ACTION_LABELS[queueActionAnimations[j]] || queueActionAnimations[j]);
        }
        dd.items = labels;
        if (labels.length > 0) dd.selectedIndex = 0;
    }
}

function createQueueTab() {
    return {
        image: "path_railings",
        widgets: [
            {
                type: "button",
                x: MARGIN,
                y: 50,
                width: 24,
                height: 24,
                name: "btnQueuePlayPause",
                image: SPR_PAUSE,
                tooltip: "Play/Pause queue",
                onClick: function () {
                    if (isQueuePaused()) {
                        resumeQueue();
                    } else {
                        pauseQueue();
                    }
                }
            },
            {
                type: "listview",
                x: MARGIN,
                y: 78,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 240,
                name: "lvQueue",
                scrollbars: "vertical",
                isStriped: true,
                showColumnHeaders: true,
                columns: [
                    { header: "#", width: 24 },
                    { header: "Action", width: 240 }
                ],
                items: [],
                canSelect: true
            },
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
            {
                type: "button",
                x: MARGIN,
                y: 348,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: 20,
                name: "btnQueueMove",
                text: "+ Move To",
                onClick: function () {
                    activateMoveTool();
                }
            },
            {
                type: "dropdown",
                x: MARGIN,
                y: 374,
                width: 130,
                height: 14,
                name: "ddQueueAction",
                items: [],
                selectedIndex: 0
            },
            {
                type: "label",
                x: 140,
                y: 374,
                width: 20,
                height: 14,
                name: "lblDuration",
                text: "for"
            },
            {
                type: "spinner",
                x: 160,
                y: 372,
                width: 55,
                height: 16,
                name: "spnDuration",
                text: "3s",
                onDecrement: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var spn = win.findWidget("spnDuration");
                    var val = parseInt(spn.text) || 3;
                    if (val > 1) val--;
                    spn.text = val + "s";
                },
                onIncrement: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var spn = win.findWidget("spnDuration");
                    var val = parseInt(spn.text) || 3;
                    if (val < 60) val++;
                    spn.text = val + "s";
                }
            },
            {
                type: "button",
                x: 220,
                y: 372,
                width: 60,
                height: 18,
                name: "btnAddAction",
                text: "+ Add",
                onClick: function () {
                    var win = ui.getWindow(WINDOW_CLASS);
                    if (!win) return;
                    var dd = win.findWidget("ddQueueAction");
                    var spn = win.findWidget("spnDuration");
                    if (!queueActionAnimations.length) return;
                    var anim = queueActionAnimations[dd.selectedIndex];
                    var dur = parseInt(spn.text) || 3;
                    addAction({ type: "action", animation: anim, duration: dur });
                    refreshQueueList();
                }
            }
        ]
    };
}

function updateQueueTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 2) return;

    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    var disableNames = ["btnQueuePlayPause", "btnDelete", "btnClearAll", "btnQueueMove", "ddQueueAction", "spnDuration", "btnAddAction"];
    for (var i = 0; i < disableNames.length; i++) {
        try {
            win.findWidget(disableNames[i]).isDisabled = !hasGuest;
        } catch (e) { }
    }

    try {
        var btnPP = win.findWidget("btnQueuePlayPause");
        var playing = hasGuest && !isQueuePaused();
        btnPP.image = playing ? SPR_PAUSE : SPR_PAUSE_PRESSED;
    } catch (e) { }

    refreshQueueActionDropdown();
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
        var desc = "";
        if (a.type === "action") {
            var label = ACTION_LABELS[a.animation] || a.animation;
            desc = label + " (" + a.duration + "s)";
        } else {
            desc = "Move \u2192 " + a.target.x + ", " + a.target.y;
        }
        items.push([
            String(i + 1),
            desc
        ]);
    }
    lv.items = items;
}

export { openWindow };
