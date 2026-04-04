import { PeepSimModel } from "./model";
import { createPeepSimWindow } from "./ui/window";
import { loadPluginState, savePluginState } from "./storage";
import { startGlobalExecutor } from "./actions";

const PLUGIN_VERSION = "0.4.0";

let sharedModel: PeepSimModel | null = null;

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

    loadPluginState();
    startGlobalExecutor();

    try {
        context.subscribe("map.changed", () => {
            loadPluginState();
            let retries = 5;
            const sub = context.subscribe("interval.tick", () => {
                retries--;
                loadPluginState();
                if (retries <= 0) sub.dispose();
            });
        });

        context.subscribe("map.save", () => {
            savePluginState();
        });
    } catch {
        // map.changed/map.save not available for local plugins on some builds
    }

    console.log(`[peepsim] loaded v${PLUGIN_VERSION}`);
}

registerPlugin({
    name: "openrct2-plugin-peepsim",
    version: PLUGIN_VERSION,
    licence: "MIT",
    authors: ["rinode"],
    type: "local",
    targetApiVersion: 77,
    main,
});
