import { button, compute, dropdown, horizontal, twoway, WidgetCreator, FlexiblePosition } from "openrct2-flexui";
import { PeepSimModel } from "../model";
import { selectGuest, spawnGuest, refreshGuestList, freezeGuest, syncAccessoriesFromGuest, resetState } from "../guest";
import { clearActions, stopDirectionWalk, deactivateMoveTool, pauseQueue } from "../actions";

export function guestSelector(model: PeepSimModel): WidgetCreator<FlexiblePosition> {
    return horizontal([
        dropdown({
            width: "1w",
            items: compute(model.guestList, list => {
                const items = ["(none)"];
                for (const g of list) {
                    items.push(`${g.name} (#${g.id})`);
                }
                return items;
            }),
            selectedIndex: twoway(model.selectedGuestIndex),
            onChange: (index: number) => {
                if (model.isRefreshing || model.tabSwitching) return;

                const list = model.guestList.get();
                const newId = (index > 0 && index <= list.length) ? list[index - 1].id : null;

                stopDirectionWalk(model);
                deactivateMoveTool(model);
                clearActions(model);
                pauseQueue(model);

                if (newId !== null) {
                    selectGuest(model, newId);
                    freezeGuest(model);
                } else {
                    resetState(model);
                }
            }
        }),
        button({
            text: "New",
            width: "50px",
            height: "14px",
            tooltip: "Spawn a new guest",
            onClick: () => {
                stopDirectionWalk(model);
                deactivateMoveTool(model);
                clearActions(model);
                pauseQueue(model);
                resetState(model);
                spawnGuest(model);
                freezeGuest(model);
                syncAccessoriesFromGuest(model);
                refreshGuestList(model);
            }
        })
    ]);
}
