const co = require('coroutine');
const os = require('os');
const util = require('util');
const net = require('net');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const defaultOptions = {
  port: 8000,
  worker: '',
  numbers: os.CPUs ? os.CPUs() : os.cpuNumbers(),
};

const _worker = path.join(__dirname, 'worker.js');

/**
 * port: 3000,
 * worker: './worker.js',
 * numbers: 4,// default to cpu numbers
 */
function Cluster(opts) {
  if (!(this instanceof Cluster)) return new Cluster(opts);
  opts = Object.assign({}, defaultOptions, opts);
  assert(!!opts.worker, 'worker must\'nt be null!');
  assert(fs.exists(opts.worker), 'worker does\'nt exists!');
  assert(!!opts.port, 'port must\'nt be null!');
  assert(util.isNumber(opts.port), 'port must be Number!');

  this.opts = opts;
  this.status = 'off';
  this.workers = [];

  const event = new co.Event();
  // init workers
  let n = opts.numbers;
  for (let j = 0; j < opts.numbers; j++) {
    const worker = new co.Worker(_worker);
    worker.onmessage = e => {
      if (util.isString(e.data)) {
        if (e.data === 'open') {
          worker.postMessage(opts.worker);
        }
        if (e.data === 'ready') {
          if (--n <= 0) {
            event.set();
          }
        }
      }
    };
    this.workers.push(worker);
  }
  event.wait();
};

Cluster.prototype.close = function stop() {
  this.socket.close();
  this.socket.dispose();
  this.status = 'off';
};

Cluster.prototype.run = function run() {
  const self = this;
  if (self.status === 'on') {
    throw new Error('server is already running!');
  }
  const socket = self.socket = new net.Socket();;
  const opts = self.opts;
  try {
    socket.bind(opts.port);
    socket.listen();
    let idx = 0;
    self.status = 'on';

    function _accept(err, con) {
      if (idx >= opts.numbers) {
        idx = 0;
      }
      self.workers[idx++].postMessage(con);
      socket.accept(_accept);
    }

    socket.accept(_accept);
  } catch (error) {
    if (error.number !== 9) {
      throw error;
    }
  }
};

module.exports = Cluster;
