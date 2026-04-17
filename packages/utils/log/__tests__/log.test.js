'use strict';

const log = require('..');
const assert = require('assert').strict;

assert.equal(typeof log.info, 'function');
assert.equal(typeof log.error, 'function');
assert.equal(typeof log.success, 'function');
assert.equal(typeof log.debug, 'function');
console.info('log tests passed');
