import {
    box, colourPicker, dropdown, groupbox, horizontal, label,
    viewport, WidgetCreator, FlexiblePosition
} from "openrct2-flexui";
import { PeepSimModel, ACCESSORY_TYPES, COLOUR_ACCESSORIES, DEFAULT_COLOURS } from "../model";
import { getSelectedGuest, setAccessory, setAccessoryColour } from "../guest";
import { guestSelector } from "./guestSelector";

const ACCESSORY_LABELS = ["None", "Hat", "Sunglasses", "Balloon", "Umbrella"];

export function appearanceTab(model: PeepSimModel): WidgetCreator<FlexiblePosition>[] {
    return [
        box({
            text: "Preview",
            height: "160px",
            content: viewport({
                target: model.guestTarget
            })
        }),
        guestSelector(model),
        groupbox({
            text: "Appearance",
            content: [
                horizontal([
                    label({ text: "Shirt colour:", width: "90px" }),
                    colourPicker({
                        colour: model.shirtColour,
                        disabled: model.noGuest,
                        onChange: (colour: number) => {
                            const guest = getSelectedGuest(model);
                            if (guest) {
                                guest.tshirtColour = colour;
                                model.shirtColour.set(colour);
                            }
                        }
                    })
                ]),
                horizontal([
                    label({ text: "Pants colour:", width: "90px" }),
                    colourPicker({
                        colour: model.pantsColour,
                        disabled: model.noGuest,
                        onChange: (colour: number) => {
                            const guest = getSelectedGuest(model);
                            if (guest) {
                                guest.trousersColour = colour;
                                model.pantsColour.set(colour);
                            }
                        }
                    })
                ]),
                horizontal([
                    label({ text: "Accessory:", width: "90px" }),
                    dropdown({
                        width: "110px",
                        items: ACCESSORY_LABELS,
                        selectedIndex: model.accessoryIndex,
                        disabled: model.noGuest,
                        onChange: (index: number) => {
                            model.accessoryIndex.set(index);
                            const type = ACCESSORY_TYPES[index];
                            if (type && COLOUR_ACCESSORIES[type]) {
                                setAccessory(model, type);
                                model.accessoryColour.set(DEFAULT_COLOURS[type]);
                                setAccessoryColour(model, DEFAULT_COLOURS[type]);
                            } else {
                                setAccessory(model, type);
                            }
                        }
                    }),
                    colourPicker({
                        colour: model.accessoryColour,
                        disabled: model.noGuest,
                        onChange: (colour: number) => {
                            setAccessoryColour(model, colour);
                        }
                    })
                ])
            ]
        })
    ];
}
