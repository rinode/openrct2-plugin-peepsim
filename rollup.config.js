import json from '@rollup/plugin-json';

const isRelease = process.env.BUILD === 'release';
const pluginPath = process.env.OPENRCT2_PLUGIN_PATH;

export default {
    input: './src/index.js',
    output: {
        file: isRelease
            ? './build/openrct2-plugin-peepsim.js'
            : pluginPath + '/openrct2-plugin-peepsim.js',
        format: 'iife'
    },
    plugins: [json()]
};