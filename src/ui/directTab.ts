import {
    box, button, compute, dropdown, groupbox, horizontal, toggle,
    vertical, viewport, WidgetCreator, FlexiblePosition, Store
} from "openrct2-flexui";
import { PeepSimModel } from "../model";
import { getSelectedGuest, freezeGuest, unfreezeGuest } from "../guest";
import {
    startDirectionWalk, stopDirectionWalk, activateMoveTool,
    deactivateMoveTool, performSelectedAction
} from "../actions";
import { guestSelector } from "./guestSelector";
import { getPauseImage } from "./pauseButton";

const SPR_DIR_NE = 5635;
const SPR_DIR_SE = 5636;
const SPR_DIR_SW = 5637;
const SPR_DIR_NW = 5638;

export function directTab(model: PeepSimModel): WidgetCreator<FlexiblePosition>[] {
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
            text: "Direct Control",
            content: [
                toggle({
                    text: "Move To",
                    height: "20px",
                    tooltip: "Click a tile to walk the guest there",
                    isPressed: model.moveToolActive,
                    disabled: model.noGuest,
                    onChange: (pressed: boolean) => {
                        if (pressed) {
                            activateMoveTool(model);
                        } else {
                            deactivateMoveTool(model);
                        }
                    }
                }),
                horizontal({
                    padding: { top: "4px", bottom: "4px" },
                    content: [
                        horizontal({ width: "1w", content: [] }),
                        vertical([
                            horizontal([
                                button({
                                    image: SPR_DIR_NW,
                                    width: "45px",
                                    height: "29px",
                                    isPressed: compute(model.heldDirection, d => d === 3),
                                    disabled: model.noGuest,
                                    onClick: () => startDirectionWalk(model, 3)
                                }),
                                button({
                                    image: SPR_DIR_NE,
                                    width: "45px",
                                    height: "29px",
                                    isPressed: compute(model.heldDirection, d => d === 0),
                                    disabled: model.noGuest,
                                    onClick: () => startDirectionWalk(model, 0)
                                })
                            ]),
                            horizontal([
                                button({
                                    image: SPR_DIR_SW,
                                    width: "45px",
                                    height: "29px",
                                    isPressed: compute(model.heldDirection, d => d === 2),
                                    disabled: model.noGuest,
                                    onClick: () => startDirectionWalk(model, 2)
                                }),
                                button({
                                    image: SPR_DIR_SE,
                                    width: "45px",
                                    height: "29px",
                                    isPressed: compute(model.heldDirection, d => d === 1),
                                    disabled: model.noGuest,
                                    onClick: () => startDirectionWalk(model, 1)
                                })
                            ])
                        ]),
                        horizontal({ width: "1w", content: [] })
                    ]
                }),
                toggle({
                    image: compute(model.guestFrozen, f => getPauseImage(f)),
                    width: "28px",
                    height: "28px",
                    border: false,
                    tooltip: "Toggle guest idle",
                    isPressed: model.guestFrozen,
                    disabled: model.noGuest,
                    padding: { left: "1w", right: "1w" },
                    onChange: (pressed: boolean) => {
                        const guest = getSelectedGuest(model);
                        if (!guest) return;
                        stopDirectionWalk(model);
                        if (pressed) {
                            freezeGuest(model);
                        } else {
                            unfreezeGuest(model);
                        }
                    }
                }),
                horizontal([
                    dropdown({
                        width: "1w",
                        items: model.actionLabels,
                        selectedIndex: model.selectedActionIndex,
                        disabled: model.noGuest,
                        onChange: (index: number) => {
                            model.selectedActionIndex.set(index);
                        }
                    }),
                    button({
                        text: "Perform",
                        width: "60px",
                        height: "16px",
                        tooltip: "Perform the selected action",
                        disabled: model.noGuest,
                        onClick: () => performSelectedAction(model)
                    })
                ])
            ]
        })
    ];
}
