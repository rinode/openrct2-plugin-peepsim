import { GuestState, createGuestState } from "./model";

// ── Centralized guest state ──────────────────────────────────────────

export const guestStates = new Map<number, GuestState>();

export function getGuestState(id: number): GuestState | undefined {
    return guestStates.get(id);
}

export function ensureGuestState(id: number): GuestState {
    let gs = guestStates.get(id);
    if (!gs) {
        gs = createGuestState();
        guestStates.set(id, gs);
    }
    return gs;
}

export function removeGuestState(id: number): void {
    guestStates.delete(id);
}

export function resetAllGuestStates(): void {
    guestStates.clear();
}
