'use strict';

module.exports = {
  '/:id': (req, id) => {
    req.response.write(`Hello, ${id}!`);
  }
};
