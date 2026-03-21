/// <reference path="C:/Program Files/OpenRCT2/bin/openrct2.d.ts" />

import { openWindow } from "./window";
import { version, name } from "../package.json";

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