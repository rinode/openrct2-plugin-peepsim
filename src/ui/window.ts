import { Colour, tab, tabwindow, WindowTemplate } from "openrct2-flexui";
import { PeepSimModel } from "../model";
import {
    refreshGuestList, enforceAccessories,
    syncAppearanceFromGuest, refreshActionAnimations,
    saveCurrentGuestState, loadGuestState, resetState
} from "../guest";
import {
    stopDirectionWalk, deactivateMoveTool, deactivatePickerTool,
    refreshQueueList, syncFromGlobalState, setUIModel
} from "../actions";
import { initPauseSprites } from "./pauseButton";
import { controlTab } from "./controlTab";
import { appearanceTab } from "./appearanceTab";
import { savePluginState } from "../storage";

const GUEST_REFRESH_INTERVAL = 80;

export function createPeepSimWindow(model: PeepSimModel): WindowTemplate {
    initPauseSprites();
    return tabwindow({
        title: "PeepSim",
        width: 300,
        height: "auto",
        padding: 5,
        colours: [Colour.Grey, Colour.OliveGreen, Colour.OliveGreen],
        onOpen: () => {
            setUIModel(model);
            model.guestRefreshCounter = 0;
            resetState(model);
            refreshGuestList(model);
        },
        onUpdate: () => {
            enforceAccessories(model);
            // Sync executor changes → UI for selected guest
            syncFromGlobalState(model);
            model.guestRefreshCounter++;
            if (model.guestRefreshCounter >= GUEST_REFRESH_INTERVAL) {
                model.guestRefreshCounter = 0;
                refreshGuestList(model);
            }
            syncAppearanceFromGuest(model);
        },
        onClose: () => {
            stopDirectionWalk(model);
            deactivatePickerTool(model);
            if (model.actionPlayInterval !== null) {
                context.clearInterval(model.actionPlayInterval);
                model.actionPlayInterval = null;
            }
            if (ui.tool) {
                ui.tool.cancel();
            }
            // Save UI state back to global guestStates, then reset
            saveCurrentGuestState(model);
            savePluginState();
            resetState(model);
            setUIModel(null);
        },
        onTabChange: () => {
            refreshGuestList(model);
            refreshActionAnimations(model);
            refreshQueueList(model);
        },
        tabs: [
            tab({
                image: 5577,
                height: "auto",
                content: controlTab(model)
            }),
            tab({
                image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
                height: "auto",
                content: appearanceTab(model)
            })
        ]
    });
}
