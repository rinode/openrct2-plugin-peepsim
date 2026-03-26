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
var MARGIN = 5;
var VP_WIDTH = WINDOW_WIDTH - MARGIN * 2;
var VP_HEIGHT = Math.round(VP_WIDTH * 9 / 16);
var VP_BOTTOM = 50 + VP_HEIGHT;

var guestRefreshCounter = 0;
var GUEST_REFRESH_INTERVAL = 80;
var lastTabIndex = -1;

function openWindow() {
    var existing = ui.getWindow(WINDOW_CLASS);
    if (existing) {
        existing.bringToFront();
        return;
    }

    startExecutor();
    initPauseSprites();
    lastTabIndex = 0;

    var directTab = createDirectTab();
    var queuedTab = createQueuedTab();
    var appearanceTab = createAppearanceTab();
    var tabHeights = [directTab._height, queuedTab._height, appearanceTab._height];
    var initH = tabHeights[0];

    function resizeToTab(win) {
        var h = tabHeights[win.tabIndex];
        win.minHeight = Math.min(h, win.height);
        win.maxHeight = Math.max(h, win.height);
        win.height = h;
        win.minHeight = h;
        win.maxHeight = h;
    }

    ui.openWindow({
        classification: WINDOW_CLASS,
        title: "PeepSim",
        width: WINDOW_WIDTH,
        height: initH,
        minWidth: WINDOW_WIDTH,
        maxWidth: WINDOW_WIDTH,
        minHeight: initH,
        maxHeight: initH,
        colours: [1, 15, 15],
        tabs: [
            directTab,
            queuedTab,
            appearanceTab
        ],
        tabIndex: 0,
        onTabChange: function () {
            var win = ui.getWindow(WINDOW_CLASS);
            if (!win) return;
            var newTab = win.tabIndex;
            if (newTab !== lastTabIndex) {
                stopDirectionTool();
                deactivateMoveTool();
                if (lastTabIndex === 0 && newTab === 1) {
                    clearActions();
                    freezeGuest();
                    pauseQueue();
                } else if (lastTabIndex === 1 && newTab === 0) {
                    clearActions();
                    freezeGuest();
                }
                lastTabIndex = newTab;
                if (newTab === 0) {
                    setControlMode("direct");
                } else if (newTab === 1) {
                    setControlMode("queued");
                }
            }
            refreshGuestDropdown();
            resizeToTab(win);
            updateDirectTab();
            updateQueuedTab();
            updateAppearanceTab();
        },
        onUpdate: function () {
            updateDirectTab();
            updateQueuedTab();
            updateAppearanceTab();
            enforceAccessories();
            guestRefreshCounter++;
            if (guestRefreshCounter >= GUEST_REFRESH_INTERVAL) {
                guestRefreshCounter = 0;
                refreshGuestDropdown();
            }
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

    refreshGuestDropdown();
}

var SPR_DIR_NE = 5635;
var SPR_DIR_SE = 5636;
var SPR_DIR_SW = 5637;
var SPR_DIR_NW = 5638;

var heldDirection = -1;
var directionInterval = null;
var moveToolActive = false;

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

var PAUSE_BTN_SIZE = 28;
var pauseSlotNormal = -1;
var pauseSlotPressed = -1;

function initPauseSprites() {
    var range = ui.imageManager.allocate(2);
    if (!range) return;
    pauseSlotNormal = range.start;
    pauseSlotPressed = range.start + 1;
    renderPauseSlot(pauseSlotNormal, SPR_PAUSE, [3, 0, 0, 5]);
    renderPauseSlot(pauseSlotPressed, SPR_PAUSE, [3, 2, 0, 5]);
}

function renderPauseSlot(slotId, spriteId, clip) {
    var W = PAUSE_BTN_SIZE;
    var H = PAUSE_BTN_SIZE;
    ui.imageManager.draw(slotId, { width: W - 3, height: H - 2 }, function (g) {
        var info = g.getImage(spriteId);
        if (!info) return;
        g.clear();
        g.colour = 54;
        g.secondaryColour = 54;
        g.tertiaryColour = 18;
        var cL = clip[0], cT = clip[1], cR = clip[2], cB = clip[3];
        var imgX = Math.floor((W - info.width) / 2 + (cR - cL) / 2) - info.offset.x + 1;
        var imgY = Math.floor((H - info.height) / 2 + (cB - cT) / 2) - info.offset.y - 1;
        g.clip(imgX + info.offset.x + cL,
               imgY + info.offset.y + cT,
               info.width - cL - cR,
               info.height - cT - cB);
        g.image(spriteId, imgX, imgY);
    });
}

function getPauseImage(pressed) {
    return pauseSlotNormal >= 0 ? pauseSlotNormal : SPR_PAUSE;
}

function onGuestSelected(index) {
    stopDirectionTool();
    deactivateMoveTool();
    clearHighlight();
    clearActions();
    pauseQueue();
    resetState();
    var list = getGuestList();
    if (index > 0 && index <= list.length) {
        selectGuest(list[index - 1].id);
        freezeGuest();
        syncAccessoriesFromGuest();
        refreshActionDropdown();
        refreshQueueActionDropdown();
    }
}

function onSpawnGuest() {
    stopDirectionTool();
    deactivateMoveTool();
    clearHighlight();
    clearActions();
    pauseQueue();
    resetState();
    spawnGuest();
    freezeGuest();
    syncAccessoriesFromGuest();
    refreshGuestDropdown();
    refreshActionDropdown();
    refreshQueueActionDropdown();
}

function guestWidgets(yGuest) {
    return [
        {
            type: "label",
            x: MARGIN,
            y: yGuest,
            width: 50,
            height: 14,
            name: "lblGuest",
            text: "Guest:"
        },
        {
            type: "dropdown",
            x: 50,
            y: yGuest - 2,
            width: 192,
            height: 14,
            name: "ddGuest",
            items: ["(none)"],
            selectedIndex: 0,
            onChange: function (index) { onGuestSelected(index); }
        },
        {
            type: "button",
            x: 250,
            y: yGuest - 2,
            width: 42,
            height: 14,
            name: "btnSpawn",
            text: "New",
            tooltip: "Spawn a new guest",
            onClick: function () { onSpawnGuest(); }
        }
    ];
}

function createDirectTab() {
    var Y_GUEST = VP_BOTTOM + 4;
    var Y_GRP   = Y_GUEST + 18;
    var Y_MOVE  = Y_GRP + 14;
    var Y_ARROWS = Y_MOVE + 24;
    var Y_ARROWS2 = Y_ARROWS + 29;
    var Y_IDLE  = Y_ARROWS2 + 33;
    var Y_ACTION = Y_IDLE + 32;
    var GRP_H   = Y_ACTION + 24 - Y_GRP;
    var TAB_H   = Y_GRP + GRP_H + MARGIN;

    var tab = {
        image: 5577,
        widgets: [
            {
                type: "custom",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpDirectBg",
                onDraw: function (g) {
                    g.colour = 0;
                    g.well(0, 0, VP_WIDTH, VP_HEIGHT);
                }
            },
            {
                type: "viewport",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpDirect"
            }
        ].concat(guestWidgets(Y_GUEST)).concat([
            {
                type: "groupbox",
                x: MARGIN,
                y: Y_GRP,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: GRP_H,
                text: "Direct Control"
            },
            {
                type: "button",
                x: MARGIN + 8,
                y: Y_MOVE,
                width: WINDOW_WIDTH - MARGIN * 2 - 16,
                height: 20,
                name: "btnMoveTo",
                text: "Move To",
                tooltip: "Click a tile to walk the guest there",
                onClick: function () {
                    if (moveToolActive) {
                        deactivateMoveTool();
                    } else {
                        activateMoveTool();
                    }
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
                onClick: function () { startDirectionTool(3); }
            },
            {
                type: "button",
                x: 150,
                y: Y_ARROWS,
                width: 45,
                height: 29,
                name: "btnDirNE",
                image: SPR_DIR_NE,
                onClick: function () { startDirectionTool(0); }
            },
            {
                type: "button",
                x: 105,
                y: Y_ARROWS2,
                width: 45,
                height: 29,
                name: "btnDirSW",
                image: SPR_DIR_SW,
                onClick: function () { startDirectionTool(2); }
            },
            {
                type: "button",
                x: 150,
                y: Y_ARROWS2,
                width: 45,
                height: 29,
                name: "btnDirSE",
                image: SPR_DIR_SE,
                onClick: function () { startDirectionTool(1); }
            },
            {
                type: "button",
                x: 138,
                y: Y_IDLE,
                width: 28,
                height: 28,
                name: "btnIdle",
                border: false,
                image: getPauseImage(false),
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
                x: MARGIN + 8,
                y: Y_ACTION,
                width: 208,
                height: 14,
                name: "ddAction",
                items: ["(select action)"],
                selectedIndex: 0
            },
            {
                type: "button",
                x: 224,
                y: Y_ACTION - 1,
                width: 54,
                height: 16,
                name: "btnPerform",
                text: "Perform",
                tooltip: "Perform the selected action",
                onClick: function () { performSelectedAction(); }
            }
        ])
    };
    tab._height = TAB_H;
    return tab;
}

function updateDirectTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 0) return;

    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    var disableNames = ["btnMoveTo", "btnDirNW", "btnDirNE", "btnDirSW", "btnDirSE", "btnIdle", "ddAction", "btnPerform"];
    for (var i = 0; i < disableNames.length; i++) {
        try {
            win.findWidget(disableNames[i]).isDisabled = !hasGuest;
        } catch (e) { }
    }

    try {
        var btnIdle = win.findWidget("btnIdle");
        if (guest) {
            var frozen = guest.getFlag("positionFrozen");
            btnIdle.image = frozen ? getPauseImage(true) : getPauseImage(false);
            btnIdle.isPressed = frozen;
        }
    } catch (e) { }

    try {
        var ddAction = win.findWidget("ddAction");
        var btnPerform = win.findWidget("btnPerform");
        var isIdle = guest && guest.getFlag("positionFrozen");
        ddAction.isDisabled = !hasGuest || !isIdle;
        btnPerform.isDisabled = !hasGuest || !isIdle;
    } catch (e) { }

    updateArrowPressed();

    var vp = win.findWidget("vpDirect");
    vp.isVisible = hasGuest;
    if (guest && vp.viewport) {
        vp.viewport.moveTo({ x: guest.x, y: guest.y, z: guest.z });
    }
}

function createQueuedTab() {
    var Y_GUEST = VP_BOTTOM + 4;
    var Y_GRP   = Y_GUEST + 18;
    var Y_PP    = Y_GRP + 14;
    var Y_LIST  = Y_PP + 32;
    var LIST_H  = 128;
    var Y_MOVE  = Y_LIST + LIST_H + 4;
    var Y_ANIM  = Y_MOVE + 24;
    var GRP_H   = Y_ANIM + 24 - Y_GRP;
    var TAB_H   = Y_GRP + GRP_H + MARGIN;

    var tab = {
        image: { frameBase: 5229, frameCount: 8, frameDuration: 4 },
        widgets: [
            {
                type: "custom",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpQueuedBg",
                onDraw: function (g) {
                    g.colour = 0;
                    g.well(0, 0, VP_WIDTH, VP_HEIGHT);
                }
            },
            {
                type: "viewport",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpQueued"
            }
        ].concat(guestWidgets(Y_GUEST)).concat([
            {
                type: "groupbox",
                x: MARGIN,
                y: Y_GRP,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: GRP_H,
                text: "Queued Control"
            },
            {
                type: "button",
                x: MARGIN + 8,
                y: Y_PP,
                width: 28,
                height: 28,
                name: "btnQueuePlayPause",
                border: false,
                image: getPauseImage(false),
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
                type: "button",
                x: WINDOW_WIDTH - MARGIN - 8 - 90 - 4 - 90,
                y: Y_PP,
                width: 90,
                height: 28,
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
                x: WINDOW_WIDTH - MARGIN - 8 - 90,
                y: Y_PP,
                width: 90,
                height: 28,
                name: "btnClearAll",
                text: "Clear All",
                onClick: function () {
                    clearActions();
                    refreshQueueList();
                }
            },
            {
                type: "listview",
                x: MARGIN + 8,
                y: Y_LIST,
                width: WINDOW_WIDTH - MARGIN * 2 - 16,
                height: LIST_H,
                name: "lvQueue",
                scrollbars: "vertical",
                isStriped: true,
                showColumnHeaders: true,
                columns: [
                    { header: "#", width: 24 },
                    { header: "Action", width: 236 }
                ],
                items: [],
                canSelect: true
            },
            {
                type: "button",
                x: MARGIN + 8,
                y: Y_MOVE,
                width: WINDOW_WIDTH - MARGIN * 2 - 16,
                height: 20,
                name: "btnQueueMove",
                text: "+ Move To",
                onClick: function () {
                    if (moveToolActive) {
                        deactivateMoveTool();
                    } else {
                        activateMoveTool();
                    }
                }
            },
            {
                type: "dropdown",
                x: MARGIN + 8,
                y: Y_ANIM,
                width: 118,
                height: 14,
                name: "ddQueueAction",
                items: [],
                selectedIndex: 0
            },
            {
                type: "label",
                x: 140,
                y: Y_ANIM,
                width: 20,
                height: 14,
                name: "lblDuration",
                text: "for"
            },
            {
                type: "spinner",
                x: 160,
                y: Y_ANIM - 2,
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
                y: Y_ANIM - 2,
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
        ])
    };
    tab._height = TAB_H;
    return tab;
}

function updateQueuedTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 1) return;

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
        btnPP.image = playing ? getPauseImage(false) : getPauseImage(true);
        btnPP.isPressed = !playing;
    } catch (e) { }

    var vp = win.findWidget("vpQueued");
    vp.isVisible = hasGuest;
    if (guest && vp.viewport) {
        vp.viewport.moveTo({ x: guest.x, y: guest.y, z: guest.z });
    }

    refreshQueueActionDropdown();
    refreshQueueList();
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

    var dd;
    try { dd = win.findWidget("ddAction"); } catch (e) { return; }
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

var queueActionAnimations = [];
var lastQueueLabels = [];

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
    var dd;
    try { dd = win.findWidget("ddQueueAction"); } catch (e) { return; }
    var labels = [];
    for (var j = 0; j < queueActionAnimations.length; j++) {
        labels.push(ACTION_LABELS[queueActionAnimations[j]] || queueActionAnimations[j]);
    }
    var newItems = labels.length > 0 ? labels : ["(none)"];
    if (newItems.join(",") !== lastQueueLabels.join(",")) {
        lastQueueLabels = newItems;
        dd.items = newItems;
        if (labels.length > 0) dd.selectedIndex = 0;
    }
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
    var dd;
    try { dd = win.findWidget("ddGuest"); } catch (e) { return; }
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

function activateMoveTool() {
    if (!getSelectedGuest()) {
        ui.showError("PeepSim", "No guest selected!");
        return;
    }
    stopDirectionTool();
    moveToolActive = true;
    updateMoveButtonPressed();
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
            moveToolActive = false;
            updateMoveButtonPressed();
            clearHighlight();
        }
    });
}

function deactivateMoveTool() {
    if (ui.tool && ui.tool.id === "peepsim-move") {
        ui.tool.cancel();
    }
    moveToolActive = false;
    updateMoveButtonPressed();
}

function updateMoveButtonPressed() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    try { win.findWidget("btnMoveTo").isPressed = moveToolActive; } catch (e) { }
    try { win.findWidget("btnQueueMove").isPressed = moveToolActive; } catch (e) { }
}

var ACCESSORY_LABELS = ["None", "Hat", "Sunglasses", "Balloon", "Umbrella"];

function createAppearanceTab() {
    var Y_GUEST = VP_BOTTOM + 4;
    var Y_GRP = Y_GUEST + 18;
    var Y0 = Y_GRP + 14;
    var GRP_H = Y0 + 56 - Y_GRP;
    var TAB_H = Y_GRP + GRP_H + MARGIN;

    var tab = {
        image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
        widgets: [
            {
                type: "custom",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpPreviewBg",
                onDraw: function (g) {
                    g.colour = 0;
                    g.well(0, 0, VP_WIDTH, VP_HEIGHT);
                }
            },
            {
                type: "viewport",
                x: MARGIN,
                y: 50,
                width: VP_WIDTH,
                height: VP_HEIGHT,
                name: "vpPreview"
            }
        ].concat(guestWidgets(Y_GUEST)).concat([
            {
                type: "groupbox",
                x: MARGIN,
                y: Y_GRP,
                width: WINDOW_WIDTH - MARGIN * 2,
                height: GRP_H,
                text: "Appearance"
            },
            {
                type: "label",
                x: MARGIN + 8,
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
                x: MARGIN + 8,
                y: Y0 + 18,
                width: 80,
                height: 14,
                name: "lblPants",
                text: "Pants colour:"
            },
            {
                type: "colourpicker",
                x: 100,
                y: Y0 + 16,
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
                x: MARGIN + 8,
                y: Y0 + 36,
                width: 80,
                height: 14,
                name: "lblAccessory",
                text: "Accessory:"
            },
            {
                type: "dropdown",
                x: 100,
                y: Y0 + 34,
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
                y: Y0 + 34,
                width: 12,
                height: 12,
                name: "cpAccessory",
                colour: 0,
                onChange: function (colour) {
                    setAccessoryColour(colour);
                }
            }
        ])
    };
    tab._height = TAB_H;
    return tab;
}

function updateAppearanceTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 2) return;

    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    var disableNames = ["cpShirt", "cpPants", "ddAccessory", "cpAccessory"];
    for (var i = 0; i < disableNames.length; i++) {
        try {
            win.findWidget(disableNames[i]).isDisabled = !hasGuest;
        } catch (e) { }
    }

    win.findWidget("vpPreview").isVisible = hasGuest;

    if (!guest) return;

    var vpPreview = win.findWidget("vpPreview");
    if (vpPreview.viewport) {
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

function refreshQueueList() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var lv;
    try { lv = win.findWidget("lvQueue"); } catch (e) { return; }
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
