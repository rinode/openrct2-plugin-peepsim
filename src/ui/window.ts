import { Colour, tab, tabwindow, WindowTemplate } from "openrct2-flexui";
import { PeepSimModel } from "../model";
import {
    refreshGuestList, enforceAccessories, resetState,
    syncAppearanceFromGuest, refreshActionAnimations
} from "../guest";
import {
    startExecutor, stopExecutor, clearActions, clearHighlight,
    stopDirectionWalk, deactivateMoveTool, pauseQueue
} from "../actions";
import { initPauseSprites } from "./pauseButton";
import { directTab } from "./directTab";
import { queuedTab } from "./queuedTab";
import { appearanceTab } from "./appearanceTab";

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
            startExecutor(model);
            model.lastTabIndex = 0;
            model.guestRefreshCounter = 0;
            refreshGuestList(model);
        },
        onUpdate: () => {
            enforceAccessories(model);
            model.guestRefreshCounter++;
            if (model.guestRefreshCounter >= GUEST_REFRESH_INTERVAL) {
                model.guestRefreshCounter = 0;
                refreshGuestList(model);
            }
            syncAppearanceFromGuest(model);
        },
        onClose: () => {
            stopDirectionWalk(model);
            if (model.actionPlayInterval !== null) {
                context.clearInterval(model.actionPlayInterval);
                model.actionPlayInterval = null;
            }
            if (ui.tool) {
                ui.tool.cancel();
            }
            stopExecutor(model);
            clearActions(model);
            clearHighlight();
            resetState(model);
        },
        onTabChange: (tabIndex: number) => {
            const prev = model.lastTabIndex;
            if (tabIndex !== prev) {
                stopDirectionWalk(model);
                deactivateMoveTool(model);
                if (prev === 0 && tabIndex === 1) {
                    clearActions(model);
                    pauseQueue(model);
                } else if (prev === 1 && tabIndex === 0) {
                    clearActions(model);
                    pauseQueue(model);
                }
                model.lastTabIndex = tabIndex;
                if (tabIndex === 0) {
                    model.controlMode.set("direct");
                } else if (tabIndex === 1) {
                    model.controlMode.set("queued");
                }
            }
            refreshGuestList(model);
            refreshActionAnimations(model);
            model.tabSwitching = false;
        },
        tabs: [
            tab({
                image: 5577,
                height: "auto",
                onClose: () => { model.tabSwitching = true; },
                content: directTab(model)
            }),
            tab({
                image: { frameBase: 5229, frameCount: 8, frameDuration: 4 },
                height: "auto",
                onClose: () => { model.tabSwitching = true; },
                content: queuedTab(model)
            }),
            tab({
                image: { frameBase: 5221, frameCount: 8, frameDuration: 4 },
                height: "auto",
                onClose: () => { model.tabSwitching = true; },
                content: appearanceTab(model)
            })
        ]
    });
}
