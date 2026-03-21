# OpenRCT2 Plugin Boilerplate

A modern boilerplate for creating OpenRCT2 plugins with ES6+ JavaScript, automatic transpilation, and CI/CD via GitHub Actions.

## Features

- ES6+ syntax with automatic transpilation to ES5
- Multi-file project support with Rollup bundling
- Hot-reloading during development with watch mode
- Automated releases via GitHub Actions
- Version management from package.json
- Modern tooling (Babel 7, Rollup 4)

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [OpenRCT2](https://openrct2.org/)

## Installation

1. Click "Use this template" to create a repo using this boilerplate
2. Clone your new repository to your computer
3. Run `npm install` to install dependencies (requires [Node.js](https://nodejs.org/))
4. Update the plugin name in `package.json` (replace `openrct2-plugin-boilerplate`)

## Configuration

### Local Development Setup

1. Copy `deploy.config.example.json` to `deploy.config.json`
2. Update the `pluginPath` to your OpenRCT2 plugin directory:
   - Windows: `C:/Users/<YourUsername>/Documents/OpenRCT2/plugin/`
   - macOS: `~/Library/Application Support/OpenRCT2/plugin/`
   - Linux: `~/.config/OpenRCT2/plugin/`

### TypeScript Definitions

Update the path in `src/index.js` to point to your OpenRCT2 installation's `openrct2.d.ts` file for IntelliSense support.

## Build Commands

- `npm run build` - Build the plugin once
- `npm run watch` - Automatically rebuild when source files change
- `npm run deploy` - Build and copy to your OpenRCT2 plugin directory

With hot-reloading enabled in OpenRCT2 and watch mode running, changes are automatically reflected in-game without restarting.

## Development

Create your plugin in the `src/` directory:
- `src/index.js` is the entry point
- Import other modules using ES6 `import` syntax
- The plugin name and version are automatically read from `package.json`

## Releases

Releases are automated via GitHub Actions:

1. Update your code and commit changes
2. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions will automatically:
   - Update `package.json` with the tag version
   - Build the plugin
   - Create a GitHub release with the built file

## License

MIT
