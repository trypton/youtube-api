# Add imports plugin for Babel

The plugin was created for adding import of fetch implementation for NodeJS to make a code isomorphic.

## Usage

```javascript
// babel.config.js

// Inserts import fetch from 'node-fetch' if fetch() call is found
const plugins = [['./dev/babel-plugin-add-imports', { imports: [{
    // Name of function
    name: 'fetch',
    // Name of node module to import from
    from: 'node-fetch'
}] }]];
module.exports = { plugins };
```
