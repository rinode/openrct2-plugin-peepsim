import {
    button, dropdown, groupbox, horizontal, toggle, vertical, viewport,
    WidgetCreator, FlexiblePosition
} from "openrct2-flexui";
import { PeepSimModel, MODE_LABELS } from "../model";
import {
    spawnGuest, refreshGuestList, freezeGuest,
    syncAccessoriesFromGuest, releaseDirectGuest, findGuest
} from "../guest";
import {
    stopDirectionWalk, deactivateMoveTool, deactivatePickerTool,
    activatePickerTool, handleModeChange
} from "../actions";

export function peepSelector(model: PeepSimModel): WidgetCreator<FlexiblePosition> {
    return groupbox({
        text: "Peep",
        content: [
            horizontal([
                viewport({
                    target: model.guestTarget,
                    height: "130px"
                }),
                vertical({
                    width: "24px",
                    content: [
                        toggle({
                            image: "eyedropper" as any,
                            width: "24px",
                            height: "24px",
                            tooltip: "Pick a guest from the park",
                            isPressed: model.pickerActive,
                            onChange: (pressed: boolean) => {
                                if (pressed) {
                                    activatePickerTool(model);
                                } else {
                                    deactivatePickerTool(model);
                                }
                            }
                        }),
                        button({
                            image: "locate" as any,
                            width: "24px",
                            height: "24px",
                            tooltip: "Find selected guest",
                            disabled: model.noGuest,
                            onClick: () => {
                                findGuest(model);
                            }
                        }),
                        button({
                            image: 29448, // SPR_G2_PEEP_SPAWN
                            width: "24px",
                            height: "24px",
                            tooltip: "Spawn a new guest",
                            onClick: () => {
                                releaseDirectGuest(model);
                                stopDirectionWalk(model);
                                deactivateMoveTool(model);
                                spawnGuest(model);
                                freezeGuest(model);
                                syncAccessoriesFromGuest(model);
                                refreshGuestList(model);
                            }
                        })
                    ]
                })
            ]),
            horizontal([
                dropdown({
                    width: "1w",
                    items: model.guestDropdownItems,
                    selectedIndex: model.selectedGuestIndex,
                    onChange: function (_index: number) {
                        // Disabled: FlexUI fires spurious onChange with arbitrary
                        // indices at unpredictable times (items.set(), tab switches,
                        // widget re-creation). Cannot distinguish from real clicks.
                        // Guest switching via picker tool / spawn button instead.
                    }
                }),
                dropdown({
                    width: "90px",
                    items: MODE_LABELS,
                    selectedIndex: model.selectedMode,
                    disabled: model.noGuest,
                    onChange: function (index: number) {
                        if (index === model.selectedMode.get()) return;
                        handleModeChange(model, index);
                    }
                })
            ])
        ]
    });
}
