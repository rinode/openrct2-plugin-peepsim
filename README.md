# PeepSim - OpenRCT2 Plugin

A guest simulator plugin for OpenRCT2. Select or spawn a guest, walk them around, change their look, and queue up sequences of moves and animations.

## Features

### Control Tab
- Select any guest from a dropdown, or spawn a new one
- Refresh button to reload the guest list
- Live viewport that follows the selected guest
- Two control modes:
  - Direct Control: move with arrow buttons, toggle idle, perform one-off animations
  - Queued Control: add actions to a queue and play/pause them
- Move To: click a tile on the map to walk the guest there (highlighted)
- Directional arrows: walk NE/SE/SW/NW with continuous hold, adjusted for camera rotation
- Idle toggle: freeze/unfreeze the guest in place
- Action dropdown: pick an animation and play it while the guest is idle

### Appearance Tab
- Shirt and pants colour pickers
- Accessory dropdown: None, Hat, Sunglasses, Balloon, or Umbrella (one at a time)
- Colour picker for accessories that support it (hat, balloon, umbrella)
- Accessories are enforced and persist while the window is open

### Queue Tab
- Play/Pause toggle for the action queue
- Queue list showing all actions (moves and animations) in order
- Delete individual actions or clear the entire queue
- Add move actions with "+ Move To" or timed animations with "+ Add"
- Actions run sequentially with stuck detection

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
- `src/index.js`: Entry point
- `src/window.js`: PeepSim window
- `src/guest.js`: Guest state management
- `src/actions.js`: Action queue executor

The plugin name and version are read from `package.json` automatically.

## Releases

Releases are automated via GitHub Actions:

1. Commit your changes
2. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions will build the plugin and create a GitHub release with the `.js` file attached.

## License

MIT
