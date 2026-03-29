import {
    box, button, dropdown, groupbox, horizontal, label,
    listview, spinner, toggle, viewport, compute,
    WidgetCreator, FlexiblePosition, twoway
} from "openrct2-flexui";
import { PeepSimModel } from "../model";
import {
    addAction, removeAction, clearActions, pauseQueue,
    resumeQueue, activateMoveTool, deactivateMoveTool, refreshQueueList
} from "../actions";
import { guestSelector } from "./guestSelector";
import { getPauseImage } from "./pauseButton";

export function queuedTab(model: PeepSimModel): WidgetCreator<FlexiblePosition>[] {
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
            text: "Queued Control",
            content: [
                horizontal([
                    toggle({
                        image: compute(model.queuePaused, p => getPauseImage(p)),
                        width: "28px",
                        height: "28px",
                        border: false,
                        tooltip: "Play/Pause queue",
                        disabled: model.noGuest,
                        isPressed: model.queuePaused,
                        onChange: (pressed: boolean) => {
                            if (pressed) {
                                pauseQueue(model);
                            } else {
                                resumeQueue(model);
                            }
                        }
                    }),
                    horizontal({ width: "1w", content: [] }),
                    button({
                        text: "Delete",
                        width: "90px",
                        height: "28px",
                        disabled: model.noGuest,
                        onClick: () => {
                            const row = model.queueSelectedRow.get();
                            if (row >= 0) {
                                removeAction(model, row);
                            }
                        }
                    }),
                    button({
                        text: "Clear All",
                        width: "90px",
                        height: "28px",
                        disabled: model.noGuest,
                        onClick: () => {
                            clearActions(model);
                        }
                    })
                ]),
                listview({
                    height: "128px",
                    scrollbars: "vertical",
                    isStriped: true,
                    columns: [
                        { header: "#", width: "24px" },
                        { header: "Action" }
                    ],
                    items: model.queueListItems,
                    canSelect: true,
                    onClick: (row: number) => {
                        model.queueSelectedRow.set(row);
                    }
                }),
                toggle({
                    text: "+ Move To",
                    height: "20px",
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
                horizontal([
                    dropdown({
                        width: "1w",
                        items: model.queueActionLabels,
                        selectedIndex: model.selectedQueueActionIndex,
                        disabled: model.noGuest,
                        onChange: (index: number) => {
                            model.selectedQueueActionIndex.set(index);
                        }
                    }),
                    label({
                        text: "for",
                        width: "20px"
                    }),
                    spinner({
                        width: "55px",
                        value: twoway(model.queueDuration),
                        minimum: 1,
                        maximum: 60,
                        disabled: model.noGuest,
                        format: (v: number) => `${v}s`
                    }),
                    button({
                        text: "+ Add",
                        width: "60px",
                        height: "18px",
                        disabled: model.noGuest,
                        onClick: () => {
                            const anims = model.queueActionAnimations.get();
                            if (!anims.length) return;
                            const anim = anims[model.selectedQueueActionIndex.get()];
                            const dur = model.queueDuration.get();
                            addAction(model, { type: "action", animation: anim, duration: dur });
                        }
                    })
                ])
            ]
        })
    ];
}
