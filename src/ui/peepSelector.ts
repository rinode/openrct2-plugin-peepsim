import {
    button, compute, dropdown, groupbox, horizontal, toggle, vertical, viewport,
    WidgetCreator, FlexiblePosition
} from "openrct2-flexui";
import { PeepSimModel, MODE_LABELS } from "../model";
import { guestStates, ensureGuestState } from "../state";
import {
    selectGuest, spawnGuest, refreshGuestList, freezeGuest,
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
                    items: compute(model.guestList, function (list) {
                        var items = ["(none)"];
                        for (var i = 0; i < list.length; i++) {
                            var g = list[i];
                            var gs = guestStates[g.id];
                            var suffix = "";
                            if (gs) {
                                if (gs.mode === "direct") suffix = " (dc)";
                                else if (gs.mode === "queued") suffix = " (qc)";
                            }
                            items.push(g.name + suffix);
                        }
                        return items;
                    }),
                    selectedIndex: model.selectedGuestIndex,
                    onChange: function (index: number) {
                        var list = model.guestList.get();
                        if (index <= 0 || index > list.length) return;
                        var newId = list[index - 1].id;
                        if (newId === model.selectedGuestId.get()) return;
                        releaseDirectGuest(model);
                        stopDirectionWalk(model);
                        deactivateMoveTool(model);
                        model.selectedGuestIndex.set(index);
                        ensureGuestState(newId);
                        selectGuest(model, newId);
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
