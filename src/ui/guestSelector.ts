import { button, compute, dropdown, horizontal, twoway, WidgetCreator, FlexiblePosition } from "openrct2-flexui";
import { PeepSimModel, MODE_LABELS } from "../model";
import {
    selectGuest, spawnGuest, refreshGuestList, freezeGuest,
    syncAccessoriesFromGuest, resetState, saveCurrentGuestState,
    loadGuestState, ensureGuestState, findGuest
} from "../guest";
import {
    stopDirectionWalk, deactivateMoveTool,
    activatePickerTool, deactivatePickerTool, handleModeChange,
    refreshQueueList
} from "../actions";

export function guestSelector(model: PeepSimModel): WidgetCreator<FlexiblePosition> {
    return horizontal([
        dropdown({
            width: "1w",
            items: compute(model.guestList, list => {
                const items = ["(none)"];
                for (var i = 0; i < list.length; i++) {
                    var g = list[i];
                    var gs = model.guestStates[g.id];
                    var suffix = "";
                    if (gs) {
                        if (gs.mode === "direct") suffix = " (dc)";
                        else if (gs.mode === "queued") suffix = " (qc)";
                    }
                    items.push(g.name + suffix);
                }
                return items;
            }),
            selectedIndex: twoway(model.selectedGuestIndex),
            onChange: (index: number) => {
                if (model.isRefreshing) return;

                const list = model.guestList.get();
                const newId = (index > 0 && index <= list.length) ? list[index - 1].id : null;

                // Save current guest state before switching
                saveCurrentGuestState(model);
                stopDirectionWalk(model);
                deactivateMoveTool(model);

                if (newId !== null) {
                    selectGuest(model, newId);
                    loadGuestState(model, newId);
                    refreshQueueList(model);
                } else {
                    resetState(model);
                }
            }
        }),
        dropdown({
            width: "90px",
            items: MODE_LABELS,
            selectedIndex: model.selectedMode,
            disabled: model.noGuest,
            onChange: (index: number) => {
                if (model.isRefreshing) return;
                handleModeChange(model, index);
            }
        }),
        button({
            text: "New",
            width: "40px",
            height: "14px",
            tooltip: "Spawn a new guest",
            onClick: () => {
                saveCurrentGuestState(model);
                stopDirectionWalk(model);
                deactivateMoveTool(model);
                spawnGuest(model);
                freezeGuest(model);
                syncAccessoriesFromGuest(model);
                refreshGuestList(model);
            }
        }),
        button({
            image: "eyedropper" as any,
            width: "24px",
            height: "14px",
            tooltip: "Pick a guest from the park",
            onClick: () => {
                activatePickerTool(model);
            }
        }),
        button({
            image: "locate" as any,
            width: "24px",
            height: "14px",
            tooltip: "Find selected guest",
            disabled: model.noGuest,
            onClick: () => {
                findGuest(model);
            }
        })
    ]);
}
