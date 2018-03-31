<a href="#less-plugin-lists">
    <img src="https://cdn.rawgit.com/seven-phases-max/less-plugin-lists/1d76ab1b/docs/logo.svg" width="100%" height="48"/>
</a>

# less-plugin-lists
[Less](http://lesscss.org) plugin for lists/arrays manipulation.

[![npm version](https://badge.fury.io/js/less-plugin-lists.svg)](http://badge.fury.io/js/less-plugin-lists)
[![dependencies](https://david-dm.org/seven-phases-max/less-plugin-lists.svg)](https://david-dm.org/seven-phases-max/less-plugin-lists)
[![dev dependencies](https://david-dm.org/seven-phases-max/less-plugin-lists/dev-status.svg)](https://david-dm.org/seven-phases-max/less-plugin-lists#info=devDependencies)

## Features

* [.for](docs/for.md) and [.for-each](docs/for-each.md) - (almost) canonical syntax for iterative statements
* [Vector Arithmetic](docs/va.md) - perform arithmetic operations on lists

## Functions

The plugin extends Less with the following functions:
- [`at       `](docs/ref.md#at)        - returns the value at the specified position in a list.
- [`cat      `](docs/ref.md#cat)       - concatenates two or more lists.
- [`flatten  `](docs/ref.md#flatten)   - returns a one-dimensional list containing all elements of an input list.
- [`join     `](docs/ref.md#join)      - joins all elements of a list into a string.
- [`l        `](docs/ref.md#l)         - creates a comma or space separated list.
- [`reverse  `](docs/ref.md#reverse)   - returns list in reversed order.
- [`slice    `](docs/ref.md#slice)     - returns selected portion of a list.
- [`splice   `](docs/ref.md#splice)    - replaces or removes selected portion of a list and returns the modified copy.
- [`transpose`](docs/ref.md#transpose) - transposes rows and columns of a list.
- [`_inspect `](docs/ref.md#_inspect)  - return a string representation of a list with debug/log formatting.

## Installation

    npm install -g less-plugin-lists
    
## Using with [`lessc`](http://lesscss.org/usage/#command-line-usage)

    lessc --lists file.less
    
For more details about using plugins with the command line Less compiler see 
[the corresponding section](http://lesscss.org/usage/#plugins-how-do-i-use-a-plugin-command-line) 
in the [Less documentation](http://lesscss.org).

## Using with common Less tools

- [`grunt-contrib-less`](https://github.com/gruntjs/grunt-contrib-less#usage-examples)
- [`gulp-less`](https://github.com/plus3network/gulp-less#using-plugins)
- [`webpack less-loader`](https://webpack.js.org/loaders/less-loader/#plugins)

## Programmatic Usage

See [Using a plugin in code](http://lesscss.org/usage/#plugins-using-a-plugin-in-code).
