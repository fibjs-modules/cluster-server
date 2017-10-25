const test = require('test');
const path = require('path');
const http = require('http');
const assert = require('assert');
const co = require('coroutine');

test.setup();

const cluster = require('../');

describe("cluster", () => {
  const worker = path.join(__dirname, 'fixtures/app.js');

  it('should new works ok', () => {
    const server = cluster({
      worker,
    });
    server.run();
    const res = co.parallel(() => {
      return http.get('http://127.0.0.1:8000').readAll().toString();
    }, 100);
    res.forEach(el => assert(el, 'Hello, World!'));
    server.close();
  });
});

process.exit(test.run(console.DEBUG));
