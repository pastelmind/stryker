[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Djavascript-mutator)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=javascript-mutator)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/javascript-mutator.svg)](https://www.npmjs.com/package/@stryker-mutator/javascript-mutator)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/javascript-mutator.svg)](https://img.shields.io/node/v/@stryker-mutator/javascript-mutator.svg)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker React mutator

**Note: This plugin is our class project for CS453 Automated Software Testing. This is not production-ready at all.**

A mutator that supports React for [Stryker](https://stryker-mutator.io), the JavaScript Mutation testing framework. This plugin does not transpile any code. The code that the @stryker-mutator/react-mutator gets should be executable in your environment (i.e. the @stryker-mutator/react-mutator does not add support for Babel projects).

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

~~`npm install --save-dev @stryker-mutator/react-mutator`~~  
*(This plugin is probably not installable yet)*

Now open up your `stryker.conf.js` (or `stryker.conf.json`) file and add the following components:

```javascript
mutator: 'react',
// OR
mutator: {
    name: 'react',
    plugins: ['classProperties', 'optionalChaining'],
    excludedMutations: ['JsxChangeNameCase']
}
```

Now give it a go:

```bash
$ stryker run
```

## Configuration

### `mutator.name` [`string`]

The name of the mutator, use `'javascript'` to enable this mutator.

### `mutator.plugins` [`(string | ParserPluginWithOptions)[]`]

Default: `['asyncGenerators', 'bigInt', 'classProperties', 'dynamicImport', 'flow', 'jsx', 'objectRestSpread', ['decorators', { decoratorsBeforeExport: true }]`

Configure custom [Babel Syntax plugins](https://babeljs.io/docs/en/babel-parser#plugins). Syntax plugins allow you to parse different pieces of syntax.
By default a number of plugins are configured. We might add more in the future. For example: you can configure your own Syntax plugins here to allow for [stage 1](https://github.com/tc39/proposals/blob/master/stage-1-proposals.md) features.

### `mutator.excludedMutations` [`string[]`]

See [Stryker core's readme](https://github.com/stryker-mutator/stryker/tree/master/packages/core#mutator)

## Mutators

The `JavaScript Mutator` is a plugin to mutate JavaScript code. This is done using Babel without any plugins.

See [test code](./test/unit/mutators) to know which mutations are supported.
