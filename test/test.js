'use strict';

const test = require('test');
const path = require('path');
const http = require('http');
const assert = require('assert');
const co = require('coroutine');

test.setup();

const cluster = require('../');

describe("cluster", () => {
  xit('should fn handler works ok', () => {
    const server = new cluster({
      worker: path.join(__dirname, 'fixtures/worker_fn.js'),
      numbers: 2
    });
    server.run();
    assert(http.get('http://127.0.0.1:8000/abc').readAll().toString(), 'Hello, Wrold!')
    server.close();
  });

  it('should router handler works ok', () => {
    const server = new cluster({
      worker: path.join(__dirname, 'fixtures/worker_router.js'),
      numbers: 2
    });
    server.run();
    assert(http.get('http://127.0.0.1:8000/abc').readAll().toString(), 'Hello, abc!')
    server.close();
  });
});

process.exit(test.run(console.DEBUG));
