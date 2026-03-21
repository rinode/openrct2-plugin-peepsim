"use strict";

(function () {
  'use strict';

  var selectedGuestId = null;
  var aiDisabled = false;
  var accessories = {
    hat: {
      enabled: false,
      colour: 6
    },
    balloon: {
      enabled: false,
      colour: 14
    },
    umbrella: {
      enabled: false,
      colour: 0
    },
    sunglasses: {
      enabled: false
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
  function setAiDisabled(disabled) {
    aiDisabled = disabled;
  }
  function isAiDisabled() {
    return aiDisabled;
  }
  function freezeGuest() {
    var guest = getSelectedGuest();
    if (guest) {
      guest.setFlag("positionFrozen", true);
    }
  }
  function unfreezeGuest() {
    var guest = getSelectedGuest();
    if (guest) {
      guest.setFlag("positionFrozen", false);
    }
  }
  function setAccessory(type, enabled) {
    accessories[type].enabled = enabled;
    var guest = getSelectedGuest();
    if (!guest) return;
    if (enabled) {
      guest.giveItem({
        type: type
      });
      applyAccessoryColour(guest, type);
    } else {
      guest.removeItem({
        type: type
      });
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
      if (accessories[type].enabled && !guest.hasItem({
        type: type
      })) {
        guest.giveItem({
          type: type
        });
        if (type !== "sunglasses") {
          applyAccessoryColour(guest, type);
        }
      }
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
    }
    selectedGuestId = null;
    aiDisabled = false;
    accessories = {
      hat: {
        enabled: false,
        colour: 6
      },
      balloon: {
        enabled: false,
        colour: 14
      },
      umbrella: {
        enabled: false,
        colour: 0
      },
      sunglasses: {
        enabled: false
      }
    };
  }
  var actionQueue = [];
  var currentAction = null;
  var tickInterval = null;
  var moveTickCount = 0;
  var lastMoveDist = -1;
  function addAction(action) {
    actionQueue.push(action);
  }
  function removeAction(index) {
    actionQueue.splice(index, 1);
  }
  function clearActions() {
    actionQueue = [];
    currentAction = null;
  }
  function getActions() {
    return actionQueue;
  }
  function hasWork() {
    return currentAction !== null || actionQueue.length > 0;
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
    clearHighlight();

    // If nothing left to do and AI is disabled, freeze
    if (actionQueue.length === 0 && isAiDisabled()) {
      freezeGuest();
    }
  }
  function executeTick() {
    var guest = getSelectedGuest();
    if (!guest) return;

    // --- Waiting for current action to complete ---
    if (currentAction !== null) {
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

    // Unfreeze so the guest can walk
    unfreezeGuest();
    guest.destination = {
      x: currentAction.target.x * 32 + 16,
      y: currentAction.target.y * 32 + 16
    };
    highlightTarget(currentAction.target);
  }
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
      tabs: [createControlTab(), createAppearanceTab(), createQueueTab()],
      tabIndex: 0,
      onUpdate: function onUpdate() {
        updateControlTab();
        updateAppearanceTab();
        updateQueueTab();
        enforceAccessories();
      },
      onClose: function onClose() {
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

  // ==================== CONTROL TAB ====================

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
      }, {
        type: "dropdown",
        x: 60,
        y: 48,
        width: 170,
        height: 14,
        name: "ddGuest",
        items: ["(none)"],
        selectedIndex: 0,
        onChange: function onChange(index) {
          // Reset old guest state before switching
          resetState();
          clearActions();
          var list = getGuestList();
          if (index > 0 && index <= list.length) {
            selectGuest(list[index - 1].id);
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
        onClick: function onClick() {
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
        onClick: function onClick() {
          spawnGuest();
          refreshGuestDropdown();
        }
      },
      // AI toggle
      {
        type: "checkbox",
        x: MARGIN,
        y: 68,
        width: 200,
        height: 14,
        name: "chkAi",
        text: "Disable AI (freeze when idle)",
        isChecked: false,
        onChange: function onChange(checked) {
          setAiDisabled(checked);
          if (checked && !hasWork()) {
            freezeGuest();
          } else if (!checked) {
            unfreezeGuest();
          }
        }
      },
      // Viewport
      {
        type: "viewport",
        x: MARGIN,
        y: 88,
        width: WINDOW_WIDTH - MARGIN * 2,
        height: 180,
        name: "vpGuest"
      },
      // Guest info
      {
        type: "label",
        x: MARGIN,
        y: 275,
        width: WINDOW_WIDTH - MARGIN * 2,
        height: 14,
        name: "lblInfo",
        text: "No guest selected"
      },
      // Move To button
      {
        type: "button",
        x: MARGIN,
        y: 295,
        width: 140,
        height: 24,
        name: "btnMoveTo",
        text: "Move To",
        tooltip: "Click a tile to walk the guest there",
        onClick: function onClick() {
          activateMoveTool();
        }
      },
      // Follow button
      {
        type: "button",
        x: 150,
        y: 295,
        width: 142,
        height: 24,
        name: "btnFollow",
        text: "Follow",
        tooltip: "Center viewport on guest",
        onClick: function onClick() {
          var guest = getSelectedGuest();
          if (guest) {
            var win = ui.getWindow(WINDOW_CLASS);
            if (win) {
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
        }
      }]
    };
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

    // Sync checkbox state from global state
    var chkAi = win.findWidget("chkAi");
    if (chkAi.isChecked !== isAiDisabled()) {
      chkAi.isChecked = isAiDisabled();
    }
    var guest = getSelectedGuest();
    var lblInfo = win.findWidget("lblInfo");
    if (guest) {
      lblInfo.text = guest.name + " | HP:" + guest.happiness + " HG:" + guest.hunger + " TH:" + guest.thirst + " $" + (guest.cash / 10).toFixed(1);
      var vp = win.findWidget("vpGuest");
      if (vp && vp.viewport) {
        vp.viewport.moveTo({
          x: guest.x,
          y: guest.y,
          z: guest.z
        });
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
          addAction({
            type: "move",
            target: {
              x: tileX,
              y: tileY
            }
          });
          refreshQueueList();
        }
      },
      onFinish: function onFinish() {
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
      }, {
        type: "colourpicker",
        x: 100,
        y: 48,
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
        y: 70,
        width: 80,
        height: 14,
        name: "lblPants",
        text: "Pants colour:"
      }, {
        type: "colourpicker",
        x: 100,
        y: 68,
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
        onChange: function onChange(checked) {
          setAccessory("hat", checked);
        }
      }, {
        type: "colourpicker",
        x: 100,
        y: 106,
        width: 12,
        height: 12,
        name: "cpHat",
        colour: 6,
        onChange: function onChange(colour) {
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
        onChange: function onChange(checked) {
          setAccessory("balloon", checked);
        }
      }, {
        type: "colourpicker",
        x: 100,
        y: 126,
        width: 12,
        height: 12,
        name: "cpBalloon",
        colour: 14,
        onChange: function onChange(colour) {
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
        onChange: function onChange(checked) {
          setAccessory("umbrella", checked);
        }
      }, {
        type: "colourpicker",
        x: 100,
        y: 146,
        width: 12,
        height: 12,
        name: "cpUmbrella",
        colour: 0,
        onChange: function onChange(colour) {
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
        onChange: function onChange(checked) {
          setAccessory("sunglasses", checked);
        }
      }]
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
    chkHat.isChecked = guest.hasItem({
      type: "hat"
    });
    chkBalloon.isChecked = guest.hasItem({
      type: "balloon"
    });
    chkUmbrella.isChecked = guest.hasItem({
      type: "umbrella"
    });
    chkSunglasses.isChecked = guest.hasItem({
      type: "sunglasses"
    });
  }

  // ==================== QUEUE TAB ====================

  function createQueueTab() {
    return {
      image: "map",
      widgets: [{
        type: "label",
        x: MARGIN,
        y: 50,
        width: 200,
        height: 14,
        name: "lblQueue",
        text: "Action Queue"
      }, {
        type: "listview",
        x: MARGIN,
        y: 66,
        width: WINDOW_WIDTH - MARGIN * 2,
        height: 250,
        name: "lvQueue",
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: true,
        columns: [{
          header: "#",
          width: 30
        }, {
          header: "Action",
          width: 80
        }, {
          header: "Target",
          width: 120
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
      // Move To (from queue tab)
      {
        type: "button",
        x: MARGIN,
        y: 348,
        width: 185,
        height: 20,
        name: "btnQueueMove",
        text: "+ Move To",
        onClick: function onClick() {
          activateMoveTool();
        }
      }]
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
      items.push([String(i + 1), a.type, a.target.x + ", " + a.target.y]);
    }
    lv.items = items;
  }
  var name = "openrct2-plugin-peepsim";
  var version = "0.1.0";

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
