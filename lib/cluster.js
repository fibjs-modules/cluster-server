'use strict';

const co = require('coroutine');
const os = require('os');
const util = require('util');
const net = require('net');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OPT_SYMBOL = Symbol('CLUSTER#OPT_SYMBOL');
const STATUS_SYMBOL = Symbol('CLUSTER#STATUS');
const WORKERS_SYMBOL = Symbol('CLUSTER#WORKERS');
const SOCKET_SYMBOL = Symbol('CLUSTER#SOCKET');

const defaultOptions = {
  port: 8000,
  worker: '',
  numbers: os.CPUs ? os.CPUs() : os.cpuNumbers(),
};

const _worker = path.join(__dirname, 'worker.js');

class Cluster {
  /**
   * 
   * @param {*} options 
   *              - port: 3000,
   *              - worker: './worker.js',
   *              - numbers: 4,// default to cpu numbers
   */
  constructor(options) {
    const opts = this[OPT_SYMBOL] = Object.assign({}, defaultOptions, options);
    assert(!!opts.worker, 'worker must\'nt be null!');
    assert(util.isString(opts.worker), 'worker must be String!');
    assert(fs.exists(opts.worker), 'worker does\'nt exists!');
    assert(!!opts.port, 'port must\'nt be null!');
    assert(util.isNumber(opts.port), 'port must be Number!');

    this[STATUS_SYMBOL] = 'off';
    this[WORKERS_SYMBOL] = [];

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
      this[WORKERS_SYMBOL].push(worker);
    }
    event.wait();
  }

  close() {
    this[SOCKET_SYMBOL].close();
    this[SOCKET_SYMBOL].dispose();
    this[STATUS_SYMBOL] = 'off';
  }

  run() {
    const self = this;
    if (self[STATUS_SYMBOL] === 'on') {
      throw new Error('server is already running!');
    }
    const socket = self[SOCKET_SYMBOL] = new net.Socket();;
    const opts = self[OPT_SYMBOL];
    try {
      socket.bind(opts.port);
      socket.listen();
      let idx = 0;
      self[STATUS_SYMBOL] = 'on';

      function _accept(err, con) {
        if (idx >= opts.numbers) {
          idx = 0;
        }
        self[WORKERS_SYMBOL][idx++].postMessage(con);
        socket.accept(_accept);
      }
      socket.accept(_accept);
    } catch (error) {
      if (error.number !== 9) {
        throw error;
      }
    }
  }
}

module.exports = Cluster;