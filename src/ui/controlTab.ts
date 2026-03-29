import {
    button, checkbox, compute, dropdown, groupbox, horizontal, label,
    listview, spinner, toggle, vertical, twoway,
    WidgetCreator, FlexiblePosition, ElementVisibility
} from "openrct2-flexui";
import { PeepSimModel } from "../model";
import { getSelectedGuest, freezeGuest, unfreezeGuest } from "../guest";
import {
    startDirectionWalk, stopDirectionWalk, activateMoveTool,
    deactivateMoveTool, deactivatePickerTool, performSelectedAction,
    addAction, removeAction, clearActions, pauseQueue, resumeQueue,
    refreshQueueList, syncSettingToGlobal
} from "../actions";
import { peepSelector } from "./peepSelector";
import { getPauseImage } from "./pauseButton";

const SPR_DIR_NE = 5635;
const SPR_DIR_SE = 5636;
const SPR_DIR_SW = 5637;
const SPR_DIR_NW = 5638;

function modeVis(model: PeepSimModel, targetMode: number) {
    return compute(model.selectedMode, m => (m === targetMode ? "visible" : "none") as ElementVisibility);
}

export function controlTab(model: PeepSimModel): WidgetCreator<FlexiblePosition>[] {
    // Shared visibility stores — one per mode, applied to every leaf control
    // so that OpenRCT2's flat widget list properly hides children.
    var vis0 = modeVis(model, 0);
    var vis1 = modeVis(model, 1);
    var vis2 = modeVis(model, 2);

    return [
        peepSelector(model),

        // ── Uncontrolled mode (0) ──────────────────────────────────────
        label({
            text: "Guest is walking freely.",
            height: "40px",
            visibility: vis0
        }),

        // ── Direct control (1) ─────────────────────────────────────────
        groupbox({
            text: "Direct Control",
            visibility: vis1,
            content: [
                toggle({
                    text: "Move To",
                    height: "20px",
                    tooltip: "Click a tile to walk the guest there",
                    isPressed: model.moveToolActive,
                    disabled: model.noGuest,
                    visibility: vis1,
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
                                    visibility: vis1,
                                    onClick: () => startDirectionWalk(model, 3)
                                }),
                                button({
                                    image: SPR_DIR_NE,
                                    width: "45px",
                                    height: "29px",
                                    isPressed: compute(model.heldDirection, d => d === 0),
                                    disabled: model.noGuest,
                                    visibility: vis1,
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
                                    visibility: vis1,
                                    onClick: () => startDirectionWalk(model, 2)
                                }),
                                button({
                                    image: SPR_DIR_SE,
                                    width: "45px",
                                    height: "29px",
                                    isPressed: compute(model.heldDirection, d => d === 1),
                                    disabled: model.noGuest,
                                    visibility: vis1,
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
                    visibility: vis1,
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
                        visibility: vis1,
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
                        visibility: vis1,
                        onClick: () => performSelectedAction(model)
                    })
                ])
            ]
        }),

        // ── Queued control (2) ─────────────────────────────────────────
        groupbox({
            text: "Queued Control",
            visibility: vis2,
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
                        visibility: vis2,
                        onChange: (pressed: boolean) => {
                            if (model.isRefreshing) return;
                            if (pressed) {
                                pauseQueue(model);
                            } else {
                                resumeQueue(model);
                            }
                            refreshQueueList(model);
                        }
                    }),
                    vertical({
                        width: "1w",
                        spacing: "1px",
                        content: [
                            checkbox({
                                text: "Auto-clear",
                                tooltip: "Remove actions from the list after they complete",
                                isChecked: compute(model.keepSteps, k => !k),
                                visibility: vis2,
                                onChange: (checked: boolean) => {
                                    if (model.isRefreshing) return;
                                    model.keepSteps.set(!checked);
                                    if (checked) {
                                        model.loopQueue.set(false);
                                    }
                                    syncSettingToGlobal(model);
                                }
                            }),
                            checkbox({
                                text: "Loop",
                                tooltip: "Loop the queue when it reaches the end",
                                isChecked: twoway(model.loopQueue),
                                disabled: compute(model.keepSteps, k => !k),
                                visibility: vis2,
                                onChange: () => {
                                    if (model.isRefreshing) return;
                                    syncSettingToGlobal(model);
                                }
                            })
                        ]
                    }),
                    button({
                        text: "Clear",
                        width: "70px",
                        height: "28px",
                        disabled: compute(model.noGuest, model.queuePaused, (ng, paused) => ng || !paused),
                        visibility: vis2,
                        onClick: () => {
                            const cell = model.queueSelectedCell.get();
                            if (cell && cell.row >= 0) {
                                removeAction(model, cell.row);
                            }
                        }
                    }),
                    button({
                        text: "Clear All",
                        width: "70px",
                        height: "28px",
                        disabled: model.noGuest,
                        visibility: vis2,
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
                        { header: "", width: "14px" },
                        { header: "#", width: "20px" },
                        { header: "Action" }
                    ],
                    items: model.queueListItems,
                    canSelect: true,
                    selectedCell: twoway(model.queueSelectedCell),
                    disabled: model.noGuest,
                    visibility: vis2,
                    onClick: (row: number) => {
                        if (!model.queuePaused.get()) return;
                        model.queueSelectedCell.set({ row: row, column: 0 });
                    }
                }),
                toggle({
                    text: "+ Move To",
                    height: "20px",
                    isPressed: model.moveToolActive,
                    disabled: model.noGuest,
                    visibility: vis2,
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
                        visibility: vis2,
                        onChange: (index: number) => {
                            model.selectedQueueActionIndex.set(index);
                        }
                    }),
                    label({
                        text: "for",
                        width: "20px",
                        visibility: vis2
                    }),
                    spinner({
                        width: "55px",
                        value: twoway(model.queueDuration),
                        minimum: 1,
                        maximum: 60,
                        disabled: model.noGuest,
                        visibility: vis2,
                        format: (v: number) => `${v}s`
                    }),
                    button({
                        text: "+ Add",
                        width: "60px",
                        height: "18px",
                        disabled: model.noGuest,
                        visibility: vis2,
                        onClick: () => {
                            const anims = model.queueActionAnimations.get();
                            const idx = model.selectedQueueActionIndex.get();
                            if (idx >= 0 && idx < anims.length) {
                                addAction(model, {
                                    type: "action",
                                    animation: anims[idx],
                                    duration: model.queueDuration.get()
                                });
                            }
                        }
                    })
                ])
            ]
        })
    ];
}
