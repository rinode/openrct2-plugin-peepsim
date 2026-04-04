# Contributing to PeepSim

## Quick Start

```bash
npm install
npm run develop   # builds to plugin folder with watch mode
npm run build     # release build to ./build/
```

The plugin output path for `develop` is set in `rollup.config.js`. TypeScript targets ES2020 for QuickJS (OpenRCT2's JS engine).

## Project Structure

```
src/
  index.ts              Entry point, plugin registration
  signal.ts             Reactive signal system (Signal, batch, bridge)
  model.ts              ViewModel: enums, GuestState, PeepSimModel, constants
  state.ts              Centralized guest state map
  guest.ts              Guest entity operations (select, spawn, freeze, accessories)
  actions.ts            Movement, sequence execution, tools, mode transitions
  storage.ts            Park storage persistence (save/load)
  ui/
    window.ts           Tab window layout and lifecycle
    peepSelector.ts     Shared "Peep" panel (viewport, picker, guest list popup)
    controlTab.ts       Direct and sequence control sections
    appearanceTab.ts    Colour pickers and accessory controls
    pauseButton.ts      Custom pause/play sprite rendering
```

## Architecture

### Reactive Signals

`GuestState` fields that the UI observes are `Signal<T>` instances (defined in `signal.ts`). Each signal holds a value and notifies subscribers on change (skipped when the value is unchanged via `===`).

```
GuestState { mode: Signal, queuePaused: Signal, ... }
     |
     +-- Executor writes: gs.queuePaused.set(true) → auto-propagates
     +-- UI handler writes: gs.mode.set(GuestMode.Direct) → auto-propagates
     |
     v  bridge() subscribes on guest switch
PeepSimModel stores (FlexUI WritableStore) ← widgets bind here
     |
     v
FlexUI Widgets
```

`PeepSimModel.bindToGuest(gs)` bridges signals to FlexUI stores. Switching guests unsubscribes the old signals and subscribes the new ones. This eliminates any manual projection or dirty-flag system.

### Batching

The `batch()` function defers signal notifications until the batch completes. The sequence executor wraps its entire tick in `batch()`, so multiple signal changes per tick (e.g. queue index + pause state) result in a single notification pass.

### State Management

`guestStates` in `state.ts` is a `Map<number, GuestState>` keyed by entity ID. It is the single source of truth for all per-guest data.

Executor-internal fields (`currentAction`, `moveTickCount`, `lastMoveDist`, `actionTickCount`) are plain values on `GuestState` — no UI observes them, so they don't need reactivity.

### Enums

All state types use string enums: `GuestMode`, `AccessoryType`, `ActionType`. This provides type safety and readable serialized values.

## Key Patterns

### Adding a new per-guest field

1. Add a `Signal<T>` field to `GuestState` in `model.ts` and initialize it in `createGuestState()`
2. Add a corresponding `WritableStore` on `PeepSimModel` if the UI needs to display it
3. Add a `bridge()` call in `bindToGuest()` to connect them
4. Add serialization in `storage.ts` (`savePluginState` and `loadPluginState`)

### Adding a new command

1. Write a function in `actions.ts` that calls `.get()`/`.set()` on the relevant signals
2. Wire it to a button or handler in the UI
3. If multiple signals change together, wrap in `batch()`

### Adding a new UI control that reads guest state

Bind the widget to a `WritableStore` on `PeepSimModel`. The store is populated by `bridge()` whenever the selected guest changes. Do not read from `guestStates` in widget code; always go through the model store.

If the widget also writes (like a checkbox), call `.set()` on the guest's signal directly in the `onChange` handler.

## OpenRCT2 and FlexUI Notes

- **QuickJS**: OpenRCT2 uses QuickJS with ES2023 support. The TypeScript compiler targets ES2020.
- **FlexUI stores**: `WritableStore.set()` is a no-op when the new value equals the old value. This makes bridging cheap for unchanged values.
- **`compute()`**: Creates a derived store that updates when any input store changes. Be careful about which stores you include as inputs.
- **Park storage**: `context.getParkStorage().set(key, value)` persists JSON-serializable data into the park file. Loaded with `.get<T>(key)`.
- **Entity IDs**: Guest entity IDs can be reused after a guest leaves the park. Always verify with `map.getEntity(id)` before operating on a stored ID.
- **`interval.tick`**: The executor subscribes to this for sequence playback. It runs for all controlled guests, not just the selected one.

## Code Style

- Modern ES6+: `const`/`let`, arrow functions, `for...of`, template literals, optional chaining
- No trailing summaries in comments. Keep comments short and factual.
- No docstring-style comments unless the function's purpose is not obvious from its name and parameters.
