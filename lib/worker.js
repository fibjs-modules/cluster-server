'use strict';

const http = require('http');
const util = require('util');
const mq = require('mq');

let worker;

const httpHandler = new http.Handler(req => worker(req));

Master.onmessage = e => {
  if (util.isString(e.data)) {
    worker = require(e.data);
    Master.postMessage('ready');
  } else {
    const con = e.data;
    mq.invoke(httpHandler, con, () => { con.close(() => { }) });
  }
};

Master.postMessage('open');
