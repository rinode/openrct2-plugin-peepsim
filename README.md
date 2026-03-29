# PeepSim - OpenRCT2 Plugin

A guest simulator plugin for OpenRCT2. Select or spawn guests, control them directly or via queued action sequences, customise their appearance, and save state per park.

## Features

The window has two tabs — **Control** and **Appearance** — each with a shared "Peep" panel showing a live viewport, guest/mode selectors, and quick-action buttons.

### Multi-Guest State

- Manage multiple guests simultaneously, each with their own control mode and queue
- Per-guest state is tracked independently and swapped when switching between guests
- Three control modes per guest:
  - **Uncontrolled** — guest walks freely under AI control, no state retained
  - **Direct Control** (dc) — manual movement and actions, guest is frozen/idle by default
  - **Queued Control** (qc) — build and play back sequences of moves and timed animations
- Guest dropdown shows mode suffix: `(dc)` for direct, `(qc)` for queued
- State persists to the park save file via `context.getParkStorage()`

### Peep Panel

- Live viewport following the selected guest
- Guest picker tool (eyedropper) — click any guest in the park to select them
- Locate button — scroll the main viewport to the selected guest
- Spawn button — create a new guest in direct control mode
- Guest dropdown and mode selector

### Direct Control

- Move To: click a tile on the map to walk the guest there
- Directional arrows: walk NE/SE/SW/NW continuously
- Idle toggle: freeze/unfreeze the guest in place
- Action dropdown: pick an animation and perform it while idle

### Queued Control

- Build a queue of moves and timed animations that run sequentially
- Play/Pause toggle with status indicator in the action list (▶ playing, || paused)
- Auto-delete: optionally remove completed actions from the list
- Loop: repeat the queue from the beginning (requires auto-delete off)
- Delete individual actions or clear the entire queue
- Add move targets with "+ Move To" or timed animations with "+ Add"
- Stuck detection for move actions

### Appearance

- Shirt and pants colour pickers
- Accessory dropdown: None, Hat, Sunglasses, Balloon, or Umbrella (one at a time)
- Colour picker for colourable accessories (hat, balloon, umbrella)
- Changing accessories in uncontrolled mode does not freeze the guest

### Save & Load

- Plugin state (all guest modes and queues) is saved into the park file
- Automatically saves on park save and window close
- Automatically loads when the window opens

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [OpenRCT2](https://openrct2.org/)

## Installation

1. Clone the repository
2. Run `npm install`
3. Run `npm run develop` to build and output directly to your plugin folder (with watch mode)

The build output path is configured in `rollup.config.js`.

## Build Commands

- `npm run build`: Build a release version to `./build/`
- `npm run develop`: Build to your plugin folder and watch for changes

## Development

Source files are in `src/`, written in TypeScript (ES5 target for Duktape compatibility):

- `index.ts` — Entry point, registers the plugin
- `model.ts` — Central ViewModel with reactive stores and types
- `guest.ts` — Guest selection, state swap, freeze/unfreeze, accessories
- `actions.ts` — Movement, queue execution, tools, mode transitions
- `storage.ts` — Park storage persistence (save/load)
- `ui/window.ts` — Two-tab window layout and lifecycle
- `ui/peepSelector.ts` — Shared Peep panel (viewport, buttons, dropdowns)
- `ui/controlTab.ts` — Direct and queued control sections
- `ui/appearanceTab.ts` — Appearance controls
- `ui/pauseButton.ts` — Custom clipped pause/play sprite rendering

## Releases

Releases are automated via GitHub Actions. Push a version tag to trigger a build:

```bash
git tag v0.3.0
git push origin v0.3.0
```

## License

MIT
