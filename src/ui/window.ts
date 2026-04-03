import { Colour, tab, tabwindow, WindowTemplate } from "openrct2-flexui";
import { PeepSimModel } from "../model";
import {
    refreshGuestList, enforceAccessories,
    syncAppearanceFromGuest, refreshActionAnimations,
    releaseDirectGuest, resetState
} from "../guest";
import {
    stopDirectionWalk, deactivatePickerTool
} from "../actions";
import { projectToUI, projectIfDirty } from "../state";
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
            model.guestRefreshCounter = 0;
            resetState(model);
            refreshGuestList(model);
            projectToUI(model);
        },
        onUpdate: () => {
            enforceAccessories(model);
            projectIfDirty(model);
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
            // Release direct-mode guest (unfreezes + removes state)
            releaseDirectGuest(model);
            savePluginState();
            resetState(model);
        },
        onTabChange: () => {
            refreshGuestList(model);
            refreshActionAnimations(model);
            projectToUI(model);
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
