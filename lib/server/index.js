'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inputDataType = exports.outputs = undefined;
exports.default = parse;

var _compositeDetect = require('composite-detect');

var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

var _assign = require('fast.js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

var _parseHelpers = require('./parseHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var outputs = exports.outputs = ['geometry']; // to be able to auto determine data type(s) fetched by parser
/**
 * @author mrdoob / http://mrdoob.com/
 * @author kaosat-dev
 */

var inputDataType = exports.inputDataType = 'arrayBuffer'; // to be able to set required input data type

function parse(data) {
  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var defaults = {
    useWorker: _compositeDetect2.default.isBrowser === true,
    offsets: [0]
  };
  parameters = (0, _assign2.default)({}, defaults, parameters);

  var _parameters = parameters;
  var useWorker = _parameters.useWorker;
  var offsets = _parameters.offsets;

  var obs = new _rx2.default.ReplaySubject(1);

  if (useWorker) {
    (function () {
      var worker = new Worker('./worker.js'); // browserify

      worker.onmessage = function (event) {
        if ('data' in event.data) {
          var data = event.data.data;
          data.objects.forEach(function (modelData, index) {
            obs.onNext({ progress: (index + 1) / Object.keys(data.objects).length, total: undefined });
            obs.onNext((0, _parseHelpers.createModelBuffers)(modelData));
          });
          obs.onNext({ progress: 1, total: undefined });
          obs.onCompleted();
        } else if ('progress' in event.data) {
          // console.log("got progress", event.data.progress)
          obs.onNext({ progress: event.data.progress, total: Math.NaN });
        }
      };
      worker.onerror = function (event) {
        obs.onError('filename:' + event.filename + ' lineno: ' + event.lineno + ' error: ' + event.message);
      };
      worker.postMessage({ data: data });
      obs.catch(function (e) {
        return worker.terminate();
      });
    })();
  } else {
    data = new _obj2.default().getData(data);

    data.objects.forEach(function (modelData, index) {
      obs.onNext({ progress: (index + 1) / Object.keys(data.objects).length, total: undefined });
      obs.onNext((0, _parseHelpers.createModelBuffers)(modelData));

      if (index >= data.objects.length) {
        // FIXME: not too sure about this implementation
        obs.onNext({ progress: 1, total: undefined });
        obs.onCompleted();
      }
    });
  }
  return obs;
}