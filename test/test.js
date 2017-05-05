const test = require('test');
const path = require('path');
const http = require('http');
const assert = require('assert');

test.setup();

const cluster = require('../');

describe("cluster", () => {
  const worker = path.join(__dirname, 'fixtures/app.js');

  it('should new works ok', () => {
    const server = cluster({
      worker,
      numbers: 1,
    });
    server.runAsync();
    const r = http.get('http://127.0.0.1:8000');
    assert(r.readAll().toString(), 'Hello, World!');
    server.close();
  });
});

process.exit(test.run(console.DEBUG));
