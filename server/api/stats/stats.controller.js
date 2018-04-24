'use strict';

// someFunc
export function someFunc(req, res) {
  console.log(req.query);
  res.send(req.query);
}