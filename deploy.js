const fs = require('fs');
const { execSync } = require('child_process');
const config = JSON.parse(fs.readFileSync('./deploy.config.json', 'utf8'));
execSync(`cpy ./build/openrct2-plugin-boilerplate.js "${config.pluginPath}" --rename=openrct2-plugin-boilerplate.js`, { stdio: 'inherit' });
