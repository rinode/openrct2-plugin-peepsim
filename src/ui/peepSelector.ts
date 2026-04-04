import {
    button, dropdown, groupbox, horizontal, label, listview,
    toggle, vertical, viewport, window as flexWindow,
    Colour, WindowTemplate, WidgetCreator, FlexiblePosition
} from "openrct2-flexui";
import { PeepSimModel, MODE_LABELS } from "../model";
import {
    spawnGuest, refreshGuestList, freezeGuest,
    syncAccessoriesFromGuest, releaseDirectGuest, findGuest,
    selectGuest
} from "../guest";
import {
    stopDirectionWalk, deactivateMoveTool, deactivatePickerTool,
    activatePickerTool, handleModeChange
} from "../actions";

let guestPickerWindow: WindowTemplate | null = null;
let guestPickerNative: any = null;

function openGuestPicker(model: PeepSimModel): void {
    if (guestPickerWindow) {
        guestPickerWindow.close();
    }
    refreshGuestList(model);
    guestPickerWindow = flexWindow({
        title: "Select Guest",
        width: 230,
        height: 200,
        position: {
            x: model.mainWindowX + model.mainWindowWidth,
            y: model.mainWindowY,
        },
        colours: [Colour.Grey, Colour.OliveGreen],
        content: [
            listview({
                height: "1w",
                scrollbars: "vertical",
                isStriped: true,
                columns: [
                    { header: "Guest" },
                    { header: "Mode", width: "70px" },
                ],
                items: model.guestListViewItems,
                canSelect: true,
                onClick: (row: number) => {
                    const list = model.guestList.get();
                    const entry = list[row];
                    if (!entry) return;
                    if (entry.id === model.selectedGuestId.get()) return;
                    releaseDirectGuest(model);
                    stopDirectionWalk(model);
                    deactivateMoveTool(model);
                    selectGuest(model, entry.id);
                    refreshGuestList(model);
                    closeGuestPicker();
                },
            }),
        ],
        onOpen: () => {
            for (let wid = 0; wid < 128; wid++) {
                try {
                    const w = ui.getWindow(wid);
                    if (w?.title === "Select Guest") {
                        guestPickerNative = w;
                        break;
                    }
                } catch { break; }
            }
        },
        onUpdate: () => {
            if (guestPickerNative) {
                guestPickerNative.x = model.mainWindowX + model.mainWindowWidth;
                guestPickerNative.y = model.mainWindowY;
            }
        },
        onClose: () => {
            guestPickerWindow = null;
            guestPickerNative = null;
            model.guestListVisible.set(false);
        },
    });
    guestPickerWindow.open();
}

export function closeGuestPicker(): void {
    if (guestPickerWindow) {
        guestPickerWindow.close();
    }
}

export function peepSelector(model: PeepSimModel): WidgetCreator<FlexiblePosition> {
    return groupbox({
        text: "Peep",
        content: [
            horizontal([
                viewport({
                    target: model.guestTarget,
                    height: "130px",
                }),
                vertical({
                    width: "24px",
                    content: [
                        toggle({
                            image: "eyedropper" as any,
                            width: "24px", height: "24px",
                            tooltip: "Pick a guest from the park",
                            isPressed: model.pickerActive,
                            onChange: (pressed: boolean) => {
                                if (pressed) activatePickerTool(model);
                                else deactivatePickerTool(model);
                            },
                        }),
                        button({
                            image: "locate" as any,
                            width: "24px", height: "24px",
                            tooltip: "Find selected guest",
                            disabled: model.noGuest,
                            onClick: () => findGuest(model),
                        }),
                        button({
                            image: 29448,
                            width: "24px", height: "24px",
                            tooltip: "Spawn a new guest",
                            onClick: () => {
                                releaseDirectGuest(model);
                                stopDirectionWalk(model);
                                deactivateMoveTool(model);
                                spawnGuest(model);
                                freezeGuest(model);
                                syncAccessoriesFromGuest(model);
                                refreshGuestList(model);
                            },
                        }),
                        toggle({
                            image: "search" as any,
                            width: "24px", height: "24px",
                            tooltip: "Select a guest from the list",
                            isPressed: model.guestListVisible,
                            onChange: (pressed: boolean) => {
                                if (pressed) {
                                    model.guestListVisible.set(true);
                                    openGuestPicker(model);
                                } else {
                                    closeGuestPicker();
                                }
                            },
                        }),
                    ],
                }),
            ]),
            horizontal([
                label({
                    text: model.selectedGuestName,
                    width: "1w",
                    height: "16px",
                }),
                dropdown({
                    width: "90px",
                    items: MODE_LABELS,
                    selectedIndex: model.selectedMode,
                    disabled: model.noGuest,
                    onChange: (index: number) => {
                        if (index === model.selectedMode.get()) return;
                        handleModeChange(model, index);
                    },
                }),
                label({ text: "", width: "24px" }),
            ]),
        ],
    });
}
