"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helperModuleImports = require("@babel/helper-module-imports");

function babelPluginAddImports() {
  return {
    name: 'add-imports',

    pre() {
      this.addedImports = new Map();
    },

    visitor: {
      Program(path, {
        opts
      }) {
        if (!Array.isArray(opts.imports)) {
          return;
        }

        opts.imports.forEach(module => {
          if (typeof module === 'string') {
            module = {
              name: module,
              from: module
            };
          }

          const {
            name,
            from
          } = module;

          if (!name || !from) {
            return;
          }

          if (Object.keys(path.scope.globals).includes(name)) {
            const node = (0, _helperModuleImports.addDefault)(path, from);
            this.addedImports.set(name, node.name);
          }
        });
      },

      CallExpression(path) {
        const name = path.node.callee.name;

        if (this.addedImports.has(name)) {
          path.node.callee.name = this.addedImports.get(name);
        }
      }

    },

    post() {
      this.addedImports.clear();
    }

  };
}

var _default = babelPluginAddImports;
exports.default = _default;
