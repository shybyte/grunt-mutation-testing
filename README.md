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
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.test
Type: `String` or `Function` 
Default value: No Default value

This test is executed for every Mutation. If it succeeds, this mutation is reported.

#### options.karma
Type: `Object` 

Karma configuration

#### options.karma.configFile
Type: `String`

Karma config file

#### options.karma.waitForServerTime
Type: `Number`
Default value: 5 (seconds)

#### options.mocha.testFiles
Type: `[String]`

Mocha configuration 

#### options.ignore
Type: `RegExp` or `[RegExp]`
Default value: undefined

Mutated code which matches this option is ignored.

### options.excludeMutations
Type: `[String]`
Default value: undefined

A list of mutation types that should not be performed.

### options.mutateProductionCode
Type: `Boolean`
Default value: false

When true, code is not copied to a temporary directory and mutated there, but instead the original production code is mutated, which can speed up your tests. _Be careful when using this option_, as, in case the mutation process does not exit correctly, your code will be left mutated.

### options.unitTestFiles
Type: `[String]`
Default value: undefined

Option to specify exactly which files are needed for running the unit tests. Supplying this can reduce the time needed to copy the files to a temporary directory, since less files need to be copied. Globbing filenames _is_ supported.

### options.maxReplacementLength
Type: `Number`
Default: 20

Specify the maximum reported length of the mutation that has been done. When set to `0`, the full mutation is logged regardless of its length.

### options.basePath
**Warning: to be renamed in the near future**

Type: `String`
Default value: undefined

Base of the path to the mutated file that will be printed in the report.


### Usage Examples

#### Default Options
In this example, the default options are used to report every possible mutation. 

```js
grunt.initConfig({
  mutationTest: {
    options: {},
    target: {
      files: {
        'tmp/report.txt': ['test/fixtures/mocha/script*.js']
      }
    }
  }
})
```

#### Custom Options
In this example all mutations are reported, which cause no failure of the grunt script.

```js
grunt.initConfig({
  mutationTest: {
    options: {
      ignore: /^log\(/,
      test: 'grunt mochaTest:fixtures'
    },
    target: {
      files: {
        'tmp/grunt.txt': ['test/fixtures/mocha/script*.js']
      }
    }
  }
})
```
Calling a test in this way is easy but **very slow**. 
It's much faster to call tests directly by providing a test function. 
This is demonstrated in this project's Gruntfile.js.

For your convenience you can easily configure fast mocha and karma tests:

##### Mocha

 ```js
 grunt.initConfig({
   mutationTest: {
      mocha: {
        options: {
          mocha: {
            testFiles: ['test/fixtures/mocha/mocha-test*.js']
          }
        },
        files: {
          'tmp/mocha.txt': ['test/fixtures/mocha/script*.js']
        }
   }
 })
 ```

##### Karma

 ```js
 grunt.initConfig({
   mutationTest: {
      karma: {
        options: {
          karma: {
            configFile: 'test/fixtures/karma-mocha/karma.conf.js',
            waitForServerTime: 5 // optional, default = 5s
          }
        },
        files: {
          'tmp/karma.txt': ['test/fixtures/karma-mocha/script*.js']
        }
      }
   }
 })
 ```

##### Logging results to console

You can provide 'LOG' as files key in order to log the results to the console. 

```js
grunt.initConfig({
  mutationTest: {
    options: {
      ignore: /^log\(/,
      test: 'grunt mochaTest:fixtures'
    },
    
    target: {
      files: {
        'LOG': ['test/fixtures/mocha/script*.js']
      }
    }
  }
})
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
- Local mutation exclusions;
- Better (HTML) reporting.

## Planned for the future
- Configuration overhaul;
- Performance improvements (mainly for Karma);
- Improve documentation;
- Karma:
  - Auto-detecting which unit test file belongs to which source code file(s);
  - Cleaner way of dealing with infinite loops introduced by mutating the code.
- Mocha:
  - Better way of inferring which files should be copied to the temporary location;
  - Deal with infinite loops introduced by mutations.
- Perform mutations on AST nodes rather than source file locations;
- Some more code refactoring;
- Splitting the project into separate modules for grunt, mutations, karma, and mocha.



## License
Copyright (c) 2015 Jimi van der Woning, Martin Koster. Licensed under the MIT license.

Original version by Marco Stahl
