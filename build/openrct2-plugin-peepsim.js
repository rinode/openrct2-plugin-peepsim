"use strict";

(function () {
  'use strict';

  var selectedGuestId = null;

  // Accessory slot groups — items in the same group are mutually exclusive
  var ACCESSORY_GROUPS = {
    head: ["hat", "sunglasses"],
    held: ["balloon", "umbrella"]
  };

  // Current state: which item is active per group, and colours
  var accessoryState = {
    head: null,
    // null = none, or "hat"/"sunglasses"
    held: null,
    // null = none, or "balloon"/"umbrella"
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
      context.executeAction("guestsetname", {
        peep: guest.id,
        name: "PeepSim"
      }, function () {});
    }
    return guest;
  }
  function getGuestList() {
    return map.getAllEntities("guest").map(function (g) {
      return {
        id: g.id,
        name: g.name
      };
    });
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
      guest.removeItem({
        type: prev
      });
    }

    // Give new item
    if (itemType) {
      guest.giveItem({
        type: itemType
      });
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
      if (active && !guest.hasItem({
        type: active
      })) {
        guest.giveItem({
          type: active
        });
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
    if (guest.hasItem({
      type: "hat"
    })) {
      accessoryState.head = "hat";
      accessoryState.colours.hat = guest.hatColour;
    } else if (guest.hasItem({
      type: "sunglasses"
    })) {
      accessoryState.head = "sunglasses";
    } else {
      accessoryState.head = null;
    }

    // Sync held group
    if (guest.hasItem({
      type: "balloon"
    })) {
      accessoryState.held = "balloon";
      accessoryState.colours.balloon = guest.balloonColour;
    } else if (guest.hasItem({
      type: "umbrella"
    })) {
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
  var actionQueue = [];
  var currentAction = null;
  var tickInterval = null;
  var moveTickCount = 0;
  var lastMoveDist = -1;
  var controlMode = "direct"; // "direct" or "queued"
  var queuePaused = false;
  var actionTickCount = 0;
  function setControlMode(mode) {
    controlMode = mode;
  }
  function getControlMode() {
    return controlMode;
  }
  function addAction(action) {
    actionQueue.push(action);
  }
  function removeAction(index) {
    actionQueue.splice(index, 1);
  }
  function clearActions() {
    actionQueue = [];
    currentAction = null;
    actionTickCount = 0;
  }
  function getActions() {
    return actionQueue;
  }
  function hasWork() {
    return currentAction !== null || actionQueue.length > 0;
  }
  function pauseQueue() {
    queuePaused = true;
    // Freeze guest if currently executing
    var guest = getSelectedGuest();
    if (guest && currentAction) {
      freezeGuest();
    }
  }
  function resumeQueue() {
    queuePaused = false;
    // Unfreeze if there's work to do
    if (hasWork()) {
      var guest = getSelectedGuest();
      if (guest && currentAction && currentAction.type === "move") {
        unfreezeGuest();
        guest.destination = {
          x: currentAction.target.x * 32 + 16,
          y: currentAction.target.y * 32 + 16
        };
      } else if (guest && currentAction && currentAction.type === "action") {
        freezeGuest();
        guest.animation = currentAction.animation;
      }
    }
  }
  function isQueuePaused() {
    return queuePaused;
  }

  // Direct mode: immediately move to target, cancel any previous action
  function directMove(tileX, tileY, skipHighlight) {
    var guest = getSelectedGuest();
    if (!guest) return;
    actionQueue = [];
    currentAction = {
      target: {
        x: tileX,
        y: tileY
      }
    };
    moveTickCount = 0;
    lastMoveDist = -1;
    unfreezeGuest();
    guest.destination = {
      x: tileX * 32 + 16,
      y: tileY * 32 + 16
    };
    {
      highlightTarget(currentAction.target);
    }
  }

  // Continuous directional walk — sets destination 2 tiles ahead without
  // going through the executor freeze/unfreeze cycle. Used by the direction
  // hold buttons for smooth, stutter-free movement.
  function directWalk(direction) {
    var guest = getSelectedGuest();
    if (!guest) return;

    // Make sure guest is unfrozen and walking
    if (guest.getFlag("positionFrozen")) {
      guest.setFlag("positionFrozen", false);
      guest.animation = "walking";
      guest.animationOffset = 0;
    }
    var rotation = ui.mainViewport.rotation;
    var adjusted = direction + rotation & 3;

    // Point 2 tiles ahead for smoother pathing
    var dx = 0,
      dy = 0;
    if (adjusted === 0) {
      dx = -2;
    } // NE
    else if (adjusted === 1) {
      dy = 2;
    } // SE
    else if (adjusted === 2) {
      dx = 2;
    } // SW
    else if (adjusted === 3) {
      dy = -2;
    } // NW

    guest.destination = {
      x: guest.x + dx * 32,
      y: guest.y + dy * 32
    };

    // Clear any executor state so it doesn't interfere
    actionQueue = [];
    currentAction = null;
    clearHighlight();
  }
  function startExecutor() {
    if (tickInterval !== null) return;
    tickInterval = context.setInterval(function () {
      executeTick();
    }, 100);
  }
  function stopExecutor() {
    if (tickInterval !== null) {
      context.clearInterval(tickInterval);
      tickInterval = null;
    }
  }
  function highlightTarget(target) {
    ui.tileSelection.tiles = [{
      x: target.x * 32,
      y: target.y * 32
    }];
  }
  function clearHighlight() {
    ui.tileSelection.tiles = [];
  }
  function finishCurrentAction() {
    currentAction = null;
    moveTickCount = 0;
    lastMoveDist = -1;
    actionTickCount = 0;
    clearHighlight();

    // If nothing left to do and AI is disabled, freeze
    if (actionQueue.length === 0 && isAiDisabled()) {
      freezeGuest();
    }
  }
  function executeTick() {
    var guest = getSelectedGuest();
    if (!guest) return;

    // Don't process if paused
    if (queuePaused) return;

    // --- Waiting for current action to complete ---
    if (currentAction !== null) {
      if (currentAction.type === "action") {
        // Animation action: count ticks for duration
        actionTickCount++;
        // 10 ticks per second (100ms interval)
        var durationTicks = (currentAction.duration || 3) * 10;
        if (actionTickCount >= durationTicks) {
          finishCurrentAction();
        }
        return;
      }

      // Move action
      var targetX = currentAction.target.x * 32 + 16;
      var targetY = currentAction.target.y * 32 + 16;
      var dx = guest.x - targetX;
      var dy = guest.y - targetY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      // Close enough — done
      if (dist < 32) {
        finishCurrentAction();
        return;
      }
      moveTickCount++;

      // Every 10 ticks (~1s), check if guest is making progress
      if (moveTickCount % 10 === 0) {
        if (lastMoveDist >= 0 && Math.abs(dist - lastMoveDist) < 4) {
          // Guest is stuck, re-nudge destination
          guest.destination = {
            x: targetX,
            y: targetY
          };
        }
        lastMoveDist = dist;
      }
      return;
    }

    // --- No current action ---
    if (actionQueue.length === 0) return;

    // Pick up next action
    currentAction = actionQueue.shift();
    moveTickCount = 0;
    lastMoveDist = -1;
    actionTickCount = 0;
    if (currentAction.type === "action") {
      // Animation action: freeze in place and set animation
      freezeGuest();
      guest.animation = currentAction.animation;
      guest.animationOffset = 0;
    } else {
      // Move action: unfreeze so the guest can walk
      unfreezeGuest();
      guest.destination = {
        x: currentAction.target.x * 32 + 16,
        y: currentAction.target.y * 32 + 16
      };
      highlightTarget(currentAction.target);
    }
  }
  var WINDOW_CLASS = "peepsim-main";
  var WINDOW_WIDTH = 300;
  var WINDOW_HEIGHT = 460;
  var MARGIN = 5;
  var VP_WIDTH = WINDOW_WIDTH - MARGIN * 2; // 290
  var VP_HEIGHT = Math.round(VP_WIDTH * 9 / 16); // 163 (16:9)
  var VP_BOTTOM = 50 + VP_HEIGHT; // 213

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
      tabs: [createControlTab(), createAppearanceTab(), createQueueTab()],
      tabIndex: 0,
      onTabChange: function onTabChange() {
        // Refresh widgets when switching tabs
        updateControlTab();
        updateAppearanceTab();
        updateQueueTab();
      },
      onUpdate: function onUpdate() {
        updateControlTab();
        updateAppearanceTab();
        updateQueueTab();
        enforceAccessories();
      },
      onClose: function onClose() {
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
    if (!win || win.tabIndex !== 0) return;
    var dirs = [{
      name: "btnDirNE",
      dir: 0
    }, {
      name: "btnDirSE",
      dir: 1
    }, {
      name: "btnDirSW",
      dir: 2
    }, {
      name: "btnDirNW",
      dir: 3
    }];
    for (var i = 0; i < dirs.length; i++) {
      try {
        var btn = win.findWidget(dirs[i].name);
        btn.isPressed = heldDirection === dirs[i].dir;
      } catch (e) {}
    }
  }

  // ==================== CONTROL TAB ==

  // Pause sprites (unpressed / pressed, like the toolbar)
  var SPR_PAUSE = 5597;
  var SPR_PAUSE_PRESSED = 5598;
  function createControlTab() {
    var Y_GUEST = VP_BOTTOM + 4; // 217
    var Y_MODE = Y_GUEST + 18; // 235
    var Y_MOVE = Y_MODE + 20; // 255
    var Y_ARROWS = Y_MOVE + 24; // 279
    var Y_ARROWS2 = Y_ARROWS + 29; // 308
    var Y_IDLE = Y_ARROWS2 + 29; // 337
    var Y_ACTION = Y_IDLE + 28; // 365
    var Y_QADD = Y_ACTION + 20; // 385

    return {
      image: "guests",
      widgets: [
      // Viewport (same position/size as appearance tab — 16:9)
      {
        type: "viewport",
        x: MARGIN,
        y: 50,
        width: VP_WIDTH,
        height: VP_HEIGHT,
        name: "vpGuest"
      },
      // Guest selection dropdown
      {
        type: "label",
        x: MARGIN,
        y: Y_GUEST,
        width: 50,
        height: 14,
        name: "lblGuest",
        text: "Guest:"
      }, {
        type: "dropdown",
        x: 50,
        y: Y_GUEST - 2,
        width: 180,
        height: 14,
        name: "ddGuest",
        items: ["(none)"],
        selectedIndex: 0,
        onChange: function onChange(index) {
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
      // Refresh button
      {
        type: "button",
        x: 235,
        y: Y_GUEST - 2,
        width: 24,
        height: 14,
        name: "btnRefresh",
        text: "R",
        tooltip: "Refresh guest list",
        onClick: function onClick() {
          refreshGuestDropdown();
        }
      },
      // Spawn button
      {
        type: "button",
        x: 262,
        y: Y_GUEST - 2,
        width: 30,
        height: 14,
        name: "btnSpawn",
        text: "New",
        tooltip: "Spawn a new guest",
        onClick: function onClick() {
          spawnGuest();
          freezeGuest();
          syncAccessoriesFromGuest();
          refreshGuestDropdown();
          refreshActionDropdown();
          refreshQueueActionDropdown();
        }
      },
      // Mode selector
      {
        type: "label",
        x: MARGIN,
        y: Y_MODE,
        width: 50,
        height: 14,
        name: "lblMode",
        text: "Mode:"
      }, {
        type: "dropdown",
        x: 50,
        y: Y_MODE - 2,
        width: 120,
        height: 14,
        name: "ddMode",
        items: ["Direct Control", "Queued Control"],
        selectedIndex: 0,
        onChange: function onChange(index) {
          var mode = index === 0 ? "direct" : "queued";
          setControlMode(mode);
          updateDirectWidgets();
        }
      },
      // Move To button (both modes)
      {
        type: "button",
        x: MARGIN,
        y: Y_MOVE,
        width: WINDOW_WIDTH - MARGIN * 2,
        height: 20,
        name: "btnMoveTo",
        text: "Move To",
        tooltip: "Click a tile to walk the guest there",
        onClick: function onClick() {
          activateMoveTool();
        }
      },
      // --- Directional arrows (direct mode only) ---
      // NW arrow (top-left)
      {
        type: "button",
        x: 105,
        y: Y_ARROWS,
        width: 45,
        height: 29,
        name: "btnDirNW",
        image: SPR_DIR_NW,
        onClick: function onClick() {
          startDirectionTool(3);
        }
      },
      // NE arrow (top-right)
      {
        type: "button",
        x: 150,
        y: Y_ARROWS,
        width: 45,
        height: 29,
        name: "btnDirNE",
        image: SPR_DIR_NE,
        onClick: function onClick() {
          startDirectionTool(0);
        }
      },
      // SW arrow (bottom-left)
      {
        type: "button",
        x: 105,
        y: Y_ARROWS2,
        width: 45,
        height: 29,
        name: "btnDirSW",
        image: SPR_DIR_SW,
        onClick: function onClick() {
          startDirectionTool(2);
        }
      },
      // SE arrow (bottom-right)
      {
        type: "button",
        x: 150,
        y: Y_ARROWS2,
        width: 45,
        height: 29,
        name: "btnDirSE",
        image: SPR_DIR_SE,
        onClick: function onClick() {
          startDirectionTool(1);
        }
      },
      // Idle button (square, pause sprite — direct mode only)
      {
        type: "button",
        x: 138,
        y: Y_IDLE,
        width: 24,
        height: 24,
        name: "btnIdle",
        image: SPR_PAUSE,
        tooltip: "Toggle guest idle",
        onClick: function onClick() {
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
      // Action dropdown + perform button (both modes)
      {
        type: "dropdown",
        x: MARGIN,
        y: Y_ACTION,
        width: 220,
        height: 14,
        name: "ddAction",
        items: ["(select action)"],
        selectedIndex: 0
      }, {
        type: "button",
        x: 230,
        y: Y_ACTION - 1,
        width: 60,
        height: 16,
        name: "btnPerform",
        text: "Perform",
        tooltip: "Perform the selected action",
        onClick: function onClick() {
          performSelectedAction();
        }
      },
      // --- Queued mode widgets ---
      // Queue action dropdown + duration + add
      {
        type: "dropdown",
        x: MARGIN,
        y: Y_QADD,
        width: 130,
        height: 14,
        name: "ddCtrlQueueAction",
        items: [],
        selectedIndex: 0
      }, {
        type: "label",
        x: 140,
        y: Y_QADD,
        width: 20,
        height: 14,
        name: "lblCtrlDuration",
        text: "for"
      }, {
        type: "spinner",
        x: 160,
        y: Y_QADD - 2,
        width: 55,
        height: 16,
        name: "spnCtrlDuration",
        text: "3s",
        onDecrement: function onDecrement() {
          var win = ui.getWindow(WINDOW_CLASS);
          if (!win) return;
          var spn = win.findWidget("spnCtrlDuration");
          var val = parseInt(spn.text) || 3;
          if (val > 1) val--;
          spn.text = val + "s";
        },
        onIncrement: function onIncrement() {
          var win = ui.getWindow(WINDOW_CLASS);
          if (!win) return;
          var spn = win.findWidget("spnCtrlDuration");
          var val = parseInt(spn.text) || 3;
          if (val < 60) val++;
          spn.text = val + "s";
        }
      }, {
        type: "button",
        x: 220,
        y: Y_QADD - 2,
        width: 50,
        height: 18,
        name: "btnCtrlAddAction",
        text: "+ Add",
        onClick: function onClick() {
          var win = ui.getWindow(WINDOW_CLASS);
          if (!win) return;
          var dd = win.findWidget("ddCtrlQueueAction");
          var spn = win.findWidget("spnCtrlDuration");
          if (!queueActionAnimations.length) return;
          var anim = queueActionAnimations[dd.selectedIndex];
          var dur = parseInt(spn.text) || 3;
          addAction({
            type: "action",
            animation: anim,
            duration: dur
          });
          refreshQueueList();
        }
      },
      // Queue play/pause toggle (queued mode only)
      {
        type: "button",
        x: 272,
        y: Y_QADD - 2,
        width: 18,
        height: 18,
        name: "btnCtrlPlayPause",
        image: SPR_PAUSE,
        tooltip: "Play/Pause queue",
        onClick: function onClick() {
          if (isQueuePaused()) {
            resumeQueue();
          } else {
            pauseQueue();
          }
        }
      }]
    };
  }
  function updateDirectWidgets() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var isDirect = getControlMode() === "direct";
    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    // Arrow buttons — direct mode only
    var arrowNames = ["btnDirNW", "btnDirNE", "btnDirSW", "btnDirSE"];
    for (var i = 0; i < arrowNames.length; i++) {
      try {
        var btn = win.findWidget(arrowNames[i]);
        btn.isVisible = isDirect;
      } catch (e) {}
    }

    // Idle button — direct mode only
    try {
      var btnIdle = win.findWidget("btnIdle");
      btnIdle.isVisible = isDirect;
      if (guest) {
        var frozen = guest.getFlag("positionFrozen");
        btnIdle.image = frozen ? SPR_PAUSE_PRESSED : SPR_PAUSE;
      }
    } catch (e) {}

    // Action dropdown + perform — always visible (both modes)
    try {
      var ddAction = win.findWidget("ddAction");
      var btnPerform = win.findWidget("btnPerform");
      var isIdle = guest && guest.getFlag("positionFrozen");
      ddAction.isDisabled = !hasGuest || !isIdle;
      btnPerform.isDisabled = !hasGuest || !isIdle;
    } catch (e) {}

    // Queued mode widgets — only visible in queued mode
    var queuedWidgets = ["ddCtrlQueueAction", "lblCtrlDuration", "spnCtrlDuration", "btnCtrlAddAction", "btnCtrlPlayPause"];
    for (var j = 0; j < queuedWidgets.length; j++) {
      try {
        var w = win.findWidget(queuedWidgets[j]);
        w.isVisible = !isDirect;
        w.isDisabled = !hasGuest;
      } catch (e) {}
    }

    // Sync queue play/pause button state
    try {
      var btnPP = win.findWidget("btnCtrlPlayPause");
      var playing = hasGuest && !isQueuePaused();
      btnPP.image = playing ? SPR_PAUSE_PRESSED : SPR_PAUSE;
    } catch (e) {}

    // Sync queued mode action dropdown
    if (!isDirect) {
      refreshCtrlQueueActionDropdown();
    }
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
  var ACTION_EXCLUDE = ["walking", "watchRide", "holdMat", "sittingIdle", "sittingEatFood", "sittingLookAroundLeft", "sittingLookAroundRight", "hanging", "drowning"];
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
  function refreshCtrlQueueActionDropdown() {
    populateQueueAnimations();
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win) return;
    var dd;
    try {
      dd = win.findWidget("ddCtrlQueueAction");
    } catch (e) {
      return;
    }
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
    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    // Sync mode dropdown
    var ddMode = win.findWidget("ddMode");
    var modeIndex = getControlMode() === "direct" ? 0 : 1;
    if (ddMode.selectedIndex !== modeIndex) {
      ddMode.selectedIndex = modeIndex;
    }
    ddMode.isDisabled = !hasGuest;

    // Disable/enable interactive widgets based on guest selection
    var disableNames = ["btnMoveTo", "btnDirNW", "btnDirNE", "btnDirSW", "btnDirSE", "btnIdle", "ddAction", "btnPerform"];
    for (var i = 0; i < disableNames.length; i++) {
      try {
        win.findWidget(disableNames[i]).isDisabled = !hasGuest;
      } catch (e) {}
    }

    // Sync arrow visibility & mode widgets
    updateDirectWidgets();

    // Update arrow pressed state (remembers direction across tab switches)
    updateArrowPressed();
    if (guest) {
      var vp = win.findWidget("vpGuest");
      if (vp && vp.viewport) {
        vp.viewport.moveTo({
          x: guest.x,
          y: guest.y,
          z: guest.z
        });
      }
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
      onMove: function onMove(e) {
        if (e.mapCoords) {
          ui.tileSelection.tiles = [{
            x: e.mapCoords.x,
            y: e.mapCoords.y
          }];
        }
      },
      onDown: function onDown(e) {
        if (e.mapCoords) {
          var tileX = Math.floor(e.mapCoords.x / 32);
          var tileY = Math.floor(e.mapCoords.y / 32);
          if (getControlMode() === "direct") {
            directMove(tileX, tileY);
          } else {
            addAction({
              type: "move",
              target: {
                x: tileX,
                y: tileY
              }
            });
            refreshQueueList();
          }
        }
      },
      onFinish: function onFinish() {
        clearHighlight();
      }
    });
  }

  // Which items in a group support colour
  var COLOUR_ITEMS = {
    hat: true,
    balloon: true,
    umbrella: true
  };
  function createAppearanceTab() {
    var Y0 = VP_BOTTOM + 4; // first row below viewport

    return {
      image: "ride",
      widgets: [
      // Guest preview viewport (same position/size as control tab — 16:9)
      {
        type: "viewport",
        x: MARGIN,
        y: 50,
        width: VP_WIDTH,
        height: VP_HEIGHT,
        name: "vpPreview"
      },
      // Shirt colour
      {
        type: "label",
        x: MARGIN,
        y: Y0,
        width: 80,
        height: 14,
        name: "lblShirt",
        text: "Shirt colour:"
      }, {
        type: "colourpicker",
        x: 100,
        y: Y0 - 2,
        width: 12,
        height: 12,
        name: "cpShirt",
        colour: 0,
        onChange: function onChange(colour) {
          var guest = getSelectedGuest();
          if (guest) guest.tshirtColour = colour;
        }
      },
      // Pants colour
      {
        type: "label",
        x: MARGIN,
        y: Y0 + 20,
        width: 80,
        height: 14,
        name: "lblPants",
        text: "Pants colour:"
      }, {
        type: "colourpicker",
        x: 100,
        y: Y0 + 18,
        width: 12,
        height: 12,
        name: "cpPants",
        colour: 0,
        onChange: function onChange(colour) {
          var guest = getSelectedGuest();
          if (guest) guest.trousersColour = colour;
        }
      },
      // --- Accessories ---
      {
        type: "groupbox",
        x: MARGIN,
        y: Y0 + 40,
        width: WINDOW_WIDTH - MARGIN * 2,
        height: 64,
        name: "gbAccessories",
        text: "Accessories"
      },
      // Head slot: None / Hat / Sunglasses
      {
        type: "label",
        x: MARGIN + 5,
        y: Y0 + 58,
        width: 40,
        height: 14,
        name: "lblHead",
        text: "Head:"
      }, {
        type: "dropdown",
        x: 60,
        y: Y0 + 56,
        width: 110,
        height: 14,
        name: "ddHead",
        items: ["None", "Hat", "Sunglasses"],
        selectedIndex: 0,
        onChange: function onChange(index) {
          var items = [null, "hat", "sunglasses"];
          setAccessoryGroup("head", items[index]);
        }
      }, {
        type: "colourpicker",
        x: 180,
        y: Y0 + 56,
        width: 12,
        height: 12,
        name: "cpHead",
        colour: 6,
        onChange: function onChange(colour) {
          setAccessoryColour("hat", colour);
        }
      },
      // Held slot: None / Balloon / Umbrella
      {
        type: "label",
        x: MARGIN + 5,
        y: Y0 + 78,
        width: 40,
        height: 14,
        name: "lblHeld",
        text: "Held:"
      }, {
        type: "dropdown",
        x: 60,
        y: Y0 + 76,
        width: 110,
        height: 14,
        name: "ddHeld",
        items: ["None", "Balloon", "Umbrella"],
        selectedIndex: 0,
        onChange: function onChange(index) {
          var items = [null, "balloon", "umbrella"];
          setAccessoryGroup("held", items[index]);
        }
      }, {
        type: "colourpicker",
        x: 180,
        y: Y0 + 76,
        width: 12,
        height: 12,
        name: "cpHeld",
        colour: 14,
        onChange: function onChange(colour) {
          var state = getAccessoryState();
          if (state.held && COLOUR_ITEMS[state.held]) {
            setAccessoryColour(state.held, colour);
          }
        }
      }]
    };
  }
  function updateAppearanceTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 1) return;
    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    // Disable/enable all interactive widgets
    var disableNames = ["cpShirt", "cpPants", "ddHead", "cpHead", "ddHeld", "cpHeld"];
    for (var i = 0; i < disableNames.length; i++) {
      try {
        win.findWidget(disableNames[i]).isDisabled = !hasGuest;
      } catch (e) {}
    }
    if (!guest) return;

    // Sync preview viewport
    var vpPreview = win.findWidget("vpPreview");
    if (vpPreview && vpPreview.viewport) {
      vpPreview.viewport.moveTo({
        x: guest.x,
        y: guest.y,
        z: guest.z
      });
    }

    // Sync clothing colours
    win.findWidget("cpShirt").colour = guest.tshirtColour;
    win.findWidget("cpPants").colour = guest.trousersColour;

    // Sync accessory state from guest
    var state = getAccessoryState();

    // Head dropdown
    var ddHead = win.findWidget("ddHead");
    var headItems = [null, "hat", "sunglasses"];
    var headIdx = headItems.indexOf(state.head);
    if (headIdx < 0) headIdx = 0;
    ddHead.selectedIndex = headIdx;

    // Head colour picker — only enabled for hat
    var cpHead = win.findWidget("cpHead");
    cpHead.isDisabled = state.head !== "hat";
    if (state.head === "hat") {
      cpHead.colour = state.colours.hat;
    }

    // Held dropdown
    var ddHeld = win.findWidget("ddHeld");
    var heldItems = [null, "balloon", "umbrella"];
    var heldIdx = heldItems.indexOf(state.held);
    if (heldIdx < 0) heldIdx = 0;
    ddHeld.selectedIndex = heldIdx;

    // Held colour picker — enabled for balloon or umbrella
    var cpHeld = win.findWidget("cpHeld");
    cpHeld.isDisabled = !state.held || !COLOUR_ITEMS[state.held];
    if (state.held === "balloon") {
      cpHeld.colour = state.colours.balloon;
    } else if (state.held === "umbrella") {
      cpHeld.colour = state.colours.umbrella;
    }
  }

  // ==================== QUEUE TAB ====================

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
      image: "map",
      widgets: [
      // Play/Pause toggle button (single square button)
      {
        type: "button",
        x: MARGIN,
        y: 50,
        width: 24,
        height: 24,
        name: "btnQueuePlayPause",
        image: SPR_PAUSE,
        tooltip: "Play/Pause queue",
        onClick: function onClick() {
          if (isQueuePaused()) {
            resumeQueue();
          } else {
            pauseQueue();
          }
        }
      },
      // Queue list
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
        columns: [{
          header: "#",
          width: 24
        }, {
          header: "Action",
          width: 240
        }],
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
        onClick: function onClick() {
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
        onClick: function onClick() {
          clearActions();
          refreshQueueList();
        }
      },
      // --- Add Actions ---
      // Move To
      {
        type: "button",
        x: MARGIN,
        y: 348,
        width: WINDOW_WIDTH - MARGIN * 2,
        height: 20,
        name: "btnQueueMove",
        text: "+ Move To",
        onClick: function onClick() {
          activateMoveTool();
        }
      },
      // Action dropdown
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
      // Duration label
      {
        type: "label",
        x: 140,
        y: 374,
        width: 20,
        height: 14,
        name: "lblDuration",
        text: "for"
      },
      // Duration spinner
      {
        type: "spinner",
        x: 160,
        y: 372,
        width: 55,
        height: 16,
        name: "spnDuration",
        text: "3s",
        onDecrement: function onDecrement() {
          var win = ui.getWindow(WINDOW_CLASS);
          if (!win) return;
          var spn = win.findWidget("spnDuration");
          var val = parseInt(spn.text) || 3;
          if (val > 1) val--;
          spn.text = val + "s";
        },
        onIncrement: function onIncrement() {
          var win = ui.getWindow(WINDOW_CLASS);
          if (!win) return;
          var spn = win.findWidget("spnDuration");
          var val = parseInt(spn.text) || 3;
          if (val < 60) val++;
          spn.text = val + "s";
        }
      },
      // Add Action button
      {
        type: "button",
        x: 220,
        y: 372,
        width: 60,
        height: 18,
        name: "btnAddAction",
        text: "+ Add",
        onClick: function onClick() {
          var win = ui.getWindow(WINDOW_CLASS);
          if (!win) return;
          var dd = win.findWidget("ddQueueAction");
          var spn = win.findWidget("spnDuration");
          if (!queueActionAnimations.length) return;
          var anim = queueActionAnimations[dd.selectedIndex];
          var dur = parseInt(spn.text) || 3;
          addAction({
            type: "action",
            animation: anim,
            duration: dur
          });
          refreshQueueList();
        }
      }]
    };
  }
  function updateQueueTab() {
    var win = ui.getWindow(WINDOW_CLASS);
    if (!win || win.tabIndex !== 2) return;
    var guest = getSelectedGuest();
    var hasGuest = !!guest;

    // Disable/enable all interactive widgets
    var disableNames = ["btnQueuePlayPause", "btnDelete", "btnClearAll", "btnQueueMove", "ddQueueAction", "spnDuration", "btnAddAction"];
    for (var i = 0; i < disableNames.length; i++) {
      try {
        win.findWidget(disableNames[i]).isDisabled = !hasGuest;
      } catch (e) {}
    }

    // Sync play/pause toggle state (pressed sprite = playing)
    try {
      var btnPP = win.findWidget("btnQueuePlayPause");
      var playing = hasGuest && !isQueuePaused();
      btnPP.image = playing ? SPR_PAUSE_PRESSED : SPR_PAUSE;
    } catch (e) {}
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
      items.push([String(i + 1), desc]);
    }
    lv.items = items;
  }
  var name = "openrct2-plugin-peepsim";
  var version = "0.0.1";

  /// <reference path="C:/Program Files/OpenRCT2/bin/openrct2.d.ts" />

  function main() {
    if (typeof ui !== "undefined") {
      ui.registerMenuItem("PeepSim", function () {
        openWindow();
      });
    }
    console.log("[peepsim] loaded v" + version);
  }
  registerPlugin({
    name: name,
    version: version,
    licence: "MIT",
    authors: [""],
    type: "local",
    targetApiVersion: 77,
    main: main
  });
})();
