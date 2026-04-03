# Contributing to PeepSim

## Quick Start

```bash
npm install
npm run develop   # builds to plugin folder with watch mode
npm run build     # release build to ./build/
```

The plugin output path for `develop` is set in `rollup.config.js`. TypeScript targets ES5 for Duktape (OpenRCT2's JS engine) compatibility.

## Project Structure

```
src/
  index.ts              Entry point, plugin registration, map event hooks
  model.ts              ViewModel: WritableStore definitions, types, constants
  state.ts              Centralized guest state, dirty flag, one-way projection
  guest.ts              Guest entity operations (select, spawn, freeze, accessories)
  actions.ts            Movement, queue execution, tools, mode transitions
  storage.ts            Park storage persistence (save/load)
  ui/
    window.ts           Tab window layout and lifecycle (onOpen, onUpdate, onClose)
    peepSelector.ts     Shared "Peep" panel (viewport, picker, guest/mode dropdowns)
    controlTab.ts       Direct and queued control sections
    appearanceTab.ts    Colour pickers and accessory controls
    pauseButton.ts      Custom pause/play sprite rendering
```

## Architecture

### State Management: Single Source of Truth

`guestStates` in `state.ts` is the single source of truth for all per-guest data. It is a plain dictionary keyed by entity ID, holding a `GuestState` object per controlled guest.

The UI binds to FlexUI `WritableStore` instances on `PeepSimModel`, but these stores are **read-only projections** of `guestStates`. They exist only so FlexUI widgets can bind to them.

Data always flows in one direction:

```
guestStates[id]  -->  projectToUI(model)  -->  UI stores  -->  widgets
```

When something needs to change guest state:

1. Mutate `guestStates[id]` directly
2. Call `projectToUI(model)` for immediate UI feedback

This is the "mutate-then-project" pattern used by all command functions (`addAction`, `removeAction`, `handleModeChange`, etc.) and checkbox/toggle handlers in the UI.

### Dirty Flag (Executor to UI)

The queue executor runs on `interval.tick` and mutates `guestStates` for all active guests each tick. It does not touch UI stores directly. Instead, after any mutation, it calls `markProjectionDirty()`.

On the next `onUpdate` tick (fired by the window), `projectIfDirty(model)` checks the dirty flag (a single boolean). If set, it calls `projectToUI`. If not, it returns immediately. This keeps the hot path O(1) when nothing changed.

```
executor tick -> mutate guestStates -> markProjectionDirty()
                                          |
window onUpdate -> projectIfDirty(model) -> projectToUI(model) (only if dirty)
```

### Projection Guard

When `projectToUI` or `refreshGuestList` programmatically updates stores, FlexUI's computed stores can fire widget `onChange` callbacks (especially the guest dropdown). The `_projecting` flag in `state.ts` prevents these from being treated as user input. Any `onChange` handler that reads from or writes to guest state should check `isProjecting()` and return early.

### Why No Bidirectional Sync

An earlier version kept UI stores and `guestStates` in sync with multiple sync functions and an `isRefreshing` flag to prevent feedback loops. This was fragile and caused bugs when FlexUI computed stores fired during programmatic updates. The current one-way projection removes the entire class of feedback-loop bugs.

## Key Patterns

### Adding a new per-guest field

1. Add the field to `GuestState` in `model.ts` and set its default in `createGuestState()`
2. Add a corresponding `WritableStore` to `PeepSimModel` if the UI needs to display it
3. Project the field in `projectToUI()` and `projectToUIDefaults()` in `state.ts`
4. Add serialization in `storage.ts` (`savePluginState` and `loadPluginState`)

### Adding a new command (queue manipulation, mode change, etc.)

1. Write a function in `actions.ts` that mutates `guestStates[id]`
2. Call `projectToUI(model)` at the end
3. Wire it to a button or handler in the UI

### Adding a new UI control that reads guest state

Bind the widget to a `WritableStore` on `PeepSimModel`. The store is populated by `projectToUI` whenever the selected guest changes or the dirty flag is set. Do not read from `guestStates` in widget code; always go through the store.

If the widget also writes (like a checkbox), mutate `guestStates[id]` in the `onChange` handler and call `projectToUI(model)`.

## OpenRCT2 and FlexUI Notes

- **Duktape target**: The TypeScript compiler targets ES5. Use `var` in hot paths, avoid `for...of` on arrays (generates slow iterator code in ES5), prefer indexed `for` loops.
- **FlexUI stores**: `WritableStore.set()` is a no-op when the new value equals the old value (by `!==`). This is why projection is cheap for primitives.
- **`compute()`**: Creates a derived store that updates when any input store changes. Be careful about which stores you include as inputs, since changes to any of them will re-evaluate the compute function and may trigger widget `onChange`.
- **Park storage**: `context.getParkStorage().set(key, value)` persists JSON-serializable data into the park file. Loaded with `.get<T>(key)`.
- **Entity IDs**: Guest entity IDs can be reused after a guest leaves the park. Always verify with `map.getEntity(id)` before operating on a stored ID.
- **`map.changed` event**: Fires when a new park is loaded. The plugin reloads state on this event, with a few retry ticks in case entities are not ready yet.
- **`interval.tick`**: The executor subscribes to this for queue playback. It runs for all controlled guests, not just the selected one.

## Code Style

- No trailing summaries in comments. Keep comments short and factual.
- Prefer colons or commas over dashes in inline comments.
- No docstring-style comments unless the function's purpose is not obvious from its name and parameters.
