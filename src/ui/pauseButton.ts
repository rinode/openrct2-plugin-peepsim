const SPR_PAUSE = 5597;
const PAUSE_BTN_SIZE = 28;

let pauseSlotNormal = -1;
let pauseSlotPressed = -1;

export function initPauseSprites(): void {
    const range = ui.imageManager.allocate(2);
    if (!range) return;
    pauseSlotNormal = range.start;
    pauseSlotPressed = range.start + 1;
    renderPauseSlot(pauseSlotNormal, SPR_PAUSE, [3, 0, 0, 5]);
    renderPauseSlot(pauseSlotPressed, SPR_PAUSE, [3, 2, 0, 5]);
}

function renderPauseSlot(slotId: number, spriteId: number, clip: number[]): void {
    const W = PAUSE_BTN_SIZE;
    const H = PAUSE_BTN_SIZE;
    ui.imageManager.draw(slotId, { width: W - 3, height: H - 2 }, (g: GraphicsContext) => {
        const info = g.getImage(spriteId);
        if (!info) return;
        g.clear();
        g.colour = 54;
        g.secondaryColour = 54;
        g.tertiaryColour = 18;
        const [cL, cT, cR, cB] = clip;
        const imgX = Math.floor((W - info.width) / 2 + (cR - cL) / 2) - info.offset.x + 1;
        const imgY = Math.floor((H - info.height) / 2 + (cB - cT) / 2) - info.offset.y - 1;
        g.clip(
            imgX + info.offset.x + cL,
            imgY + info.offset.y + cT,
            info.width - cL - cR,
            info.height - cT - cB,
        );
        g.image(spriteId, imgX, imgY);
    });
}

export function getPauseImage(pressed: boolean): number {
    if (pressed) return pauseSlotPressed >= 0 ? pauseSlotPressed : SPR_PAUSE;
    return pauseSlotNormal >= 0 ? pauseSlotNormal : SPR_PAUSE;
}
