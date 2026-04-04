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


export function createPeepSimWindow(model: PeepSimModel): WindowTemplate {
    initPauseSprites();
    return tabwindow({
        title: "PeepSim",
        width: 300,
        height: "auto",
        padding: 5,
        colours: [Colour.Grey, Colour.OliveGreen, Colour.OliveGreen],
        onOpen: () => {
            resetState(model);
            refreshGuestList(model);
            projectToUI(model);
        },
        onUpdate: () => {
            enforceAccessories(model);
            projectIfDirty(model);
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
            releaseDirectGuest(model);
            savePluginState();
            resetState(model);
        },
        onTabChange: () => {
            refreshActionAnimations(model);
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
