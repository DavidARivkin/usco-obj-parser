'use strict';

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

self.onmessage = function (event) {

  var data = event.data;
  data = data.data;

  var result = new _obj2.default().getData(data);

  self.postMessage({ data: result });
  self.close();
};