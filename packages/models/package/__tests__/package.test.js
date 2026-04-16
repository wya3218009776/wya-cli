'use strict';

const assert = require('assert').strict;
const path = require('path');
const Package = require('..');

const pkg = new Package({
  targetPath: path.resolve(__dirname, '../.cache'),
  packageName: '@wya-cli/template-vue3',
  packageVersion: 'latest',
});

assert.equal(pkg.exists(), true);
assert.match(pkg.packageRootPath, /template-vue3$/);
console.info('package tests passed');
