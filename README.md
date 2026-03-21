# PeepSim - OpenRCT2 Plugin

A guest simulator plugin for OpenRCT2. Select or spawn a guest and take direct control — move them around the map, customise their appearance, and queue up actions.

## Features

### Control Tab
- Select any guest from a dropdown or spawn a new one
- Live viewport that follows the selected guest
- Guest stats display (happiness, hunger, thirst, cash)
- **Move To** — click a tile on the map to walk the guest there, with tile highlighting
- **Follow** — re-center the viewport on the guest
- **Disable AI** — freeze the guest when idle, preventing autonomous behaviour

### Appearance Tab
- Change shirt and pants colours
- Toggle accessories: hat, balloon, umbrella, sunglasses
- Colour pickers for hat, balloon, and umbrella
- Accessories are enforced and persist even if the game tries to remove them

### Queue Tab
- View all queued move actions in a list
- Add actions from the queue tab with **+ Move To**
- Delete individual actions or clear the entire queue
- Actions execute sequentially with automatic stuck detection

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [OpenRCT2](https://openrct2.org/)

## Installation

1. Clone the repository
2. Run `npm install`
3. Copy `deploy.config.example.json` to `deploy.config.json`
4. Update `pluginPath` to your OpenRCT2 plugin directory:
   - Windows: `C:/Users/<YourUsername>/Documents/OpenRCT2/plugin/`
   - macOS: `~/Library/Application Support/OpenRCT2/plugin/`
   - Linux: `~/.config/OpenRCT2/plugin/`
5. Run `npm run build && npm run deploy`

## Build Commands

- `npm run build` — Build the plugin
- `npm run watch` — Rebuild automatically on source changes
- `npm run deploy` — Copy the built plugin to your OpenRCT2 plugin directory

## Development

Source files are in `src/`:
- `src/index.js` — Entry point, registers the plugin and menu item
- `src/window.js` — UI window with three tabs (Control, Appearance, Queue)
- `src/guest.js` — Guest state management (selection, AI, accessories)
- `src/actions.js` — Action queue executor with stuck detection and tile highlighting

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
