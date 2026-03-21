import json from '@rollup/plugin-json';

export default {
    input: './src/index.js',
    output: {
        file: './build/openrct2-plugin-boilerplate.js',
        format: 'iife'
    },
    plugins: [json()]
};