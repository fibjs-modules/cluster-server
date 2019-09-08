'use strict';

const util = require('util');
const mq = require('mq');

let httpHandler;

Master.onmessage = e => {
  if (util.isString(e.data)) {
    const worker = require(e.data);
    httpHandler = new mq.HttpHandler(worker);
    Master.postMessage('ready');
  } else {
    const con = e.data;
    mq.invoke(httpHandler, con, () => { con.close(() => { }) });
  }
};

Master.postMessage('open');
