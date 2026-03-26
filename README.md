# PeepSim - OpenRCT2 Plugin

A guest simulator plugin for OpenRCT2. Select or spawn a guest, walk them around, change their look, and queue up sequences of moves and animations.

## Features

The window has three tabs, each with a live viewport that follows the selected guest.

### Direct Control
- Select any guest from a dropdown, or spawn a new one
- Guest list refreshes automatically
- Move To: click a tile on the map to walk the guest there
- Directional arrows: walk NE/SE/SW/NW continuously, adjusted for camera rotation
- Idle toggle: freeze/unfreeze the guest in place
- Action dropdown: pick an animation and perform it while idle

### Queued Control
- Build a queue of moves and timed animations that run sequentially
- Play/Pause toggle for the queue (auto-pauses when finished)
- Delete individual actions or clear the entire queue
- Add move targets with "+ Move To" or timed animations with "+ Add"
- Stuck detection for move actions

### Appearance
- Shirt and pants colour pickers
- Accessory dropdown: None, Hat, Sunglasses, Balloon, or Umbrella (one at a time)
- Colour picker for accessories that support it (hat, balloon, umbrella)
- Accessories persist while the window is open

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [OpenRCT2](https://openrct2.org/)

## Installation

1. Clone the repository
2. Run `npm install`
3. Set the `OPENRCT2_PLUGIN_PATH` environment variable to your OpenRCT2 plugin directory:
   - Windows: `C:/Users/<YourUsername>/Documents/OpenRCT2/plugin`
   - macOS: `~/Library/Application Support/OpenRCT2/plugin`
   - Linux: `~/.config/OpenRCT2/plugin`
4. Run `npm run develop` to build and output directly to your plugin folder (with watch mode)

## Build Commands

- `npm run build`: Build a release version to `./build/`
- `npm run develop`: Build to your plugin folder and watch for changes

## Development

Source files are in `src/`:
- `index.js` — Entry point, registers the plugin
- `window.js` — Window layout and per-tab update logic
- `guest.js` — Guest state and accessory management
- `actions.js` — Action queue and tick executor

Plugin name and version are read from `package.json`.

## Releases

Releases are automated via GitHub Actions. Push a version tag to trigger a build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
