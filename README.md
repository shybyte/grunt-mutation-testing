# grunt-mutation-testing

> JavaScript Mutation Testing as grunt plugin. Tests your tests by mutating the code.

[![Build Status](https://api.travis-ci.org/jimivdw/grunt-mutation-testing.svg?branch=master)](https://travis-ci.org/jimivdw/grunt-mutation-testing)

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-mutation-testing --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mutation-testing');
```

## The "mutationTest" task

### Overview
In your project's Gruntfile, add a section named `mutationTest` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  mutationTest: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific options go here.
    },
  },
})
```

### Options

#### File options

##### options.code
**Required**
Type: `String` or `[String]`

List of source code files needed to successfully run your unit tests (including required libraries).

##### options.specs
**Required**
Type: `String` or `[String]`

List of unit test specifications that need to be run.

##### options.mutate
**Required**
Type: `String` or `[String]`

List of source code files that should be mutation tested.

##### options.basePath
_optional_
Type: `String`
Default: `"."`

Base path from which to look for the code, specs, and mutation files


#### Test framework options

##### options.testFramework
_optional_
Type: `String`
Default: `"karma"`

The test framework to use. Available values: `karma`, `mocha`.

##### options.karma
_optional_
Type: `Object`

Karma-specific options. See the [Karma documentation](http://karma-runner.github.io/) for available options.

In order for Karma to be able to run properly, it is necessary to at least provide the `frameworks` and `browsers` options. You should usually be able to reuse your existing Karma config file for this (by supplying it in the `configFile` option).

Note that some options (`basePath`, `files`, `background`, `singleRun`, `autoWatch`, and `port`) are overwritten automatically by the mutation testing framework.

##### options.mocha
_optional_
Type: `Object`

Mocha-specific options. See the [Mocha documentation](http://mochajs.org/) for available options.


#### Reporting options

##### options.logLevel
_optional_
Type: `String`
Default: `INFO`

The used log level. Available options: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, `OFF`.

##### options.reporters
_optional_
Type: `Object`
Default: `{ console: true }`

Configuration of reporters to use. Available options: `console`, `text`, `html`.

##### options.reporters.text.dir
_optional_
Type: `String`
Default: `"reports/grunt-mutation-testing"`

Directory to place the text report in.

##### options.reporters.text.file
_optional_
Type: `String`
Default: `grunt-mutation-testing.txt`

Filename of the text report.

##### options.reporters.html.dir
_optional_
Type: `String`
Default: `"reports/grunt-mutation-testing"`

Directory to place the HTML report in.

##### options.reporters.html.successThreshold
_optional_
Type: `Number`
Default: `80`

Percentage of mutations that should be killed in order for a test result to be considered successful.

##### options.maxReportedMutationLength
_optional_
Type: `Number`
Default: 80

The maximum reported length of the mutation that has been done. When set to `0`, the full mutation is logged regardless of its length.


#### Other options

##### options.ignore
_optional_
Type: `String` or `RegExp` or `[String and/or RegExp]`
Default: `/('use strict'|"use strict");/`

Code that matches with any of the supplied regular expressions will not be mutated in any way.

Note that, by default, mutations on the strict mode keyword `'use strict'` will be ignored. If you really do want to mutate it, this can be done by providing the `options.discardDefaultIgnore` option (see below).

##### options.ignoreReplacement
_optional_
Type: `String` or `RegExp` or `[String and/or RegExp]`

Mutation replacements that match with any of the supplied regular expressions will not be introduced.

##### options.excludeMutations
_optional_
Type: `Object`

A set of properties, indicating whether certain mutations should be excluded for all files. See below for a list of available mutations.

##### options.mutateProductionCode
_optional_
Type: `Boolean`
Default: `false`

When true, code is not copied to a temporary directory and mutated there, but instead the original production code is mutated, which can speed up your tests.

_Be careful when using this option_, as, in case the mutation process does not exit correctly, your code will be left mutated.

##### options.discardDefaultIgnore
_optional_
Type: `Boolean`
Default: `false`

When true, mutations that are ignored by default (see `options.ignore`, above) will no longer be ignored.

We do not really see any relevant use case for this, but did not want to make it impossible to perform certain mutations either. Hence the existence of this configuration option.

##### options.test
_optional_
Type: `String` or `Function`

This test is executed for every Mutation. If it passes, this mutation is reported as 'survived'.


### Usage Examples

#### Default Options
In this example, the default options are used to report every possible mutation.

```js
grunt.initConfig({
    mutationTest: {
        options: {},
        target: {
            code: ['src/*.js', 'src/lib/myLib/*.js'],
            specs: 'test/**/*KarmaSpec.js',
            mutate: 'src/*.js'
        }
    }
});
```

#### Custom Options
In this example all mutations are reported, which cause no failure of the grunt script.

```js
grunt.initConfig({
    mutationTest: {
        options: {
            test: 'grunt test'
        },
        target: {
            code: ['src/*.js', 'src/lib/myLib/*.js'],
            specs: 'test/**/*KarmaSpec.js',
            mutate: 'src/*.js'
        }
    }
});
```
Calling a test in this way is easy but **very slow**.
It's much faster to call tests directly by providing a test function.
This is demonstrated in this project's Gruntfile.js.

For your convenience you can easily configure fast mocha and karma tests:

##### Mocha

```js
grunt.initConfig({
    mutationTest: {
        options: {
            testFramework: 'mocha'
        },
        target: {
            code: ['src/*.js', 'src/lib/myLib/*.js'],
            specs: 'test/**/*MochaSpec.js',
            mutate: 'src/*.js'
        }
    }
});
```

##### Karma

```js
grunt.initConfig({
    mutationTest: {
        options: {
            karma: {
                waitForServerTime: 10 // optional, only used for illustration purposes here
            }
        },
        target: {
            code: ['src/*.js', 'src/lib/myLib/*.js'],
            specs: 'test/**/*KarmaSpec.js',
            mutate: 'src/*.js'
        }
    }
});
```

## Available mutations
Currently, the following mutations are available:

| Mutation code        | Description                                                   | Example                                                                       |
|----------------------|---------------------------------------------------------------|-------------------------------------------------------------------------------|
| `MATH`               | Replace arithmetic operators by their opposites               | `1 + 1` to `1 - 1`                                                            |
| `ARRAY`              | Remove elements from an array                                 | `[1,2,3]` to `[1,3]`                                                          |
| `BLOCK_STATEMENT`    | Remove statements from a block of statements                  | `function foo(x) { x = x * 2; return x; }` to `function foo(x) { return x; }` |
| `METHOD_CALL`        | Mutate parameters of a function call                          | `foo(x)` to `x`                                                               |
| `COMPARISON`         | Replace operators by their boundary and negation counterparts | `x < 10` to `x <= 10`                                                         |
| `LITERAL`            | Replace strings, increment numbers, and negate booleans       | `var x = 'Hello'` to `var x = '"MUTATION!"'`                                  |
| `LOGICAL_EXPRESSION` | Replace logical operators by their opposites                  | `x && y` to `x || y`                                                          |
| `OBJECT`             | Remove object properties                                      | `{a: 10, b: 'B'}` to `{b: 'B'}`                                               |
| `UNARY_EXPRESSION`   | Negate unary expressions                                      | `var x = -42` to `var x = 42`                                                 |
| `UPDATE_EXPRESSION`  | Negate update expressions                                     | `x++` to `x--`                                                                |

## Excluding mutations
Since not all mutations may be relevant for your project, it is possible to configure which mutations should be performed and which should not.

### Global exclusions
In order to completely disable a specific mutation, one can provide the excludeMutations configuration option. This takes an object where the keys represent the mutations and the values denote whether the mutation should in fact be excluded. For example:
```js
{
  mutationTest: {
    options: {
      excludeMutations: {
        'MATH': true,
        'LITERAL': false,
        'OBJECT': true
      }
    },
    // ...
  }
}
```
would disable the `MATH` and `OBJECT` mutations, while the `LITERAL` mutations are still active.

### Local exclusions
In some cases, more fine-tuning is needed for which mutations should be excluded where. It is possible to disable mutations _on block level_ by prepending the code with a comment containing the `@excludeMutations` keyword.

When only the `@excludeMutations` comment is provided, _all_ mutations will be excluded for the block above which that comment is placed. It is also possible to provide an array of specific mutations that should be excluded, e.g.:
```js
function foo() {
  // ...
}

/**
 * @excludeMutations ['MATH', 'OBJECT']
 */
function bar() {
  // ...
}
```
would disable the `MATH` and `OBJECT` mutations on the `bar` method and its contents, but not on `foo`.

All javascript comment types are supported, i.e. one can use both `// @excludeMutations` _and_ `/* @excludeMutations ["ARRAY"] */`. These comments can also be placed in the middle of a line of code, object, or function call, to allow for very specific configuration.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### v 1.0.1
- Fixed HTML reporter not properly escaping HTML; 
- Fixed Karma not working when coverage reports could not be generated or found:
  - Added fallback where all tests are run against all code;
  - Made the coverage detection framework also work with KarmaCoverage v0.1.x;
  - Moved Karma and KarmaCoverage to devDependencies.

### v 1.0.0
- Configuration overhaul;
- Improved console output;
- Karma:
  - Auto-detecting which unit test file belongs to which source code file(s);
  - Cleaner way of dealing with infinite loops introduced by mutating the code.
- Mocha:
  - Better way of inferring which files should be copied to the temporary location.

#### Upgrading from v0.x to v1.0
When upgrading from v0.x to v1.0, one will notice that a lot has changed. Most important of these changes is the new way in which the grunt-mutation-test task needs to be configured.

Rather than supplying a map of output files to a list of files that should be mutated, one now needs to configure which files are needed to run the unit tests, which unit test files should be included, and which files should be mutated. This is done by supplying the `code`, `specs`, and `mutate` options respectively. Take a look at the usage examples above for a few example configurations.

### v 0.7.0
- Local mutation exclusions;
- HTML mutation coverage reporting.

### v 0.6.0
- Mutate a temporary copy of the code, rather than the original files;
- Fixed this project's unit tests on Windows.

### v 0.5.1
- Reduced chances for mutations resulting in endless loops by disabling mutations on loop invariants.

### v 0.5.0
- Added unary expression mutations;
- Added logical expression mutations.

### v 0.4.0
- Revived project;
- Added many new mutations;
- Fixed a couple of Karma-related issues;
- Improved reporting.

## Planned for the next release
- Improve documentation;
- Improve console output;
- Some more code refactoring.

## Planned for the future
- Performance improvements (mainly for Karma);
- Karma:
  - Cleaner way of dealing with infinite loops introduced by mutating the code.
- Mocha:
  - Deal with infinite loops introduced by mutations.
- Perform mutations on AST nodes rather than source file locations;
- Splitting the project into separate modules for grunt, mutations, karma, and mocha.



## License
Copyright (c) 2015 Jimi van der Woning, Martin Koster. Licensed under the MIT license.

Original version by Marco Stahl
