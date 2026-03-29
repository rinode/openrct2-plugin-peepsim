import { PeepSimModel } from "./model";
import { createPeepSimWindow } from "./ui/window";
import { loadPluginState, savePluginState } from "./storage";
import { startGlobalExecutor } from "./actions";
import { saveCurrentGuestState } from "./guest";

const PLUGIN_VERSION = "0.3.0";

// Shared model instance — survives window close/reopen
var sharedModel: PeepSimModel | null = null;

export function getSharedModel(): PeepSimModel {
    if (!sharedModel) {
        sharedModel = new PeepSimModel();
    }
    return sharedModel;
}

function main(): void {
    if (typeof ui !== "undefined") {
        ui.registerMenuItem("PeepSim", () => {
            const model = getSharedModel();
            createPeepSimWindow(model).open();
        });
    }

    // Load guest states + freeze controlled guests on park load.
    loadPluginState();
    startGlobalExecutor();

    context.subscribe("map.changed", () => {
        loadPluginState();
        // Retry a few ticks later in case entities aren't ready yet
        var retries = 5;
        var sub = context.subscribe("interval.tick", () => {
            retries--;
            loadPluginState();
            if (retries <= 0) {
                sub.dispose();
            }
        });
    });

    context.subscribe("map.save", () => {
        if (sharedModel) {
            saveCurrentGuestState(sharedModel);
        }
        savePluginState();
    });

    console.log(`[peepsim] loaded v${PLUGIN_VERSION}`);
}

registerPlugin({
    name: "openrct2-plugin-peepsim",
    version: PLUGIN_VERSION,
    licence: "MIT",
    authors: ["rinode"],
    type: "local",
    targetApiVersion: 77,
    main: main
});
