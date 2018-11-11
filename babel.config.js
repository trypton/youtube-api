const presets = [
    [
        '@babel/env',
        {
            targets: {
                node: true
            }
        }
    ]
];

const plugins = [['./dev/babel-plugin-add-imports', { imports: [{ name: 'fetch', from: 'node-fetch' }] }]];

module.exports = { presets, plugins };
