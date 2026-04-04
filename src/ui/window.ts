import { Colour, tab, tabwindow, WindowTemplate } from "openrct2-flexui";
import { PeepSimModel } from "../model";
import {
    refreshGuestList, enforceAccessories,
    syncAppearanceFromGuest, refreshActionAnimations,
    releaseDirectGuest, resetState
} from "../guest";
import { stopDirectionWalk, deactivatePickerTool } from "../actions";
import { initPauseSprites } from "./pauseButton";
import { controlTab } from "./controlTab";
import { closeGuestPicker } from "./peepSelector";
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
        },
        onUpdate: () => {
            // Cache main window position only when guest picker is open
            if (model.guestListVisible.get()) {
                for (let wid = 0; wid < 128; wid++) {
                    try {
                        const w = ui.getWindow(wid);
                        if (w?.title === "PeepSim") {
                            model.mainWindowX = w.x;
                            model.mainWindowY = w.y;
                            model.mainWindowWidth = w.width;
                            break;
                        }
                    } catch { break; }
                }
            }
            // Only sync appearance when a guest is selected
            if (model.selectedGuestId.get() !== null) {
                enforceAccessories(model);
                syncAppearanceFromGuest(model);
            }
        },
        onClose: () => {
            closeGuestPicker();
            stopDirectionWalk(model);
            deactivatePickerTool(model);
            if (model.actionPlayInterval !== null) {
                context.clearInterval(model.actionPlayInterval);
                model.actionPlayInterval = null;
            }
            if (ui.tool) ui.tool.cancel();
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
                content: controlTab(model),
            }),
            tab({
                image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
                height: "auto",
                content: appearanceTab(model),
            }),
        ],
    });
}
