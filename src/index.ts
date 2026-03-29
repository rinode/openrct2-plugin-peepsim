import { PeepSimModel } from "./model";
import { createPeepSimWindow } from "./ui/window";

const PLUGIN_VERSION = "0.2.0";

function main(): void {
    if (typeof ui !== "undefined") {
        ui.registerMenuItem("PeepSim", () => {
            const model = new PeepSimModel();
            createPeepSimWindow(model).open();
        });
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
    main: main
});
