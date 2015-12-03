(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.objParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
(function () {
  // Hueristics.
  var isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node;
  var isBrowser = typeof window !== 'undefined';
  var isModule = typeof module !== 'undefined' && !!module.exports;

  // Export.
  var detect = (isModule ? exports : (this.detect = {}));
  detect.isNode = isNode;
  detect.isBrowser = isBrowser;
  detect.isModule = isModule;
}).call(this);
}).call(this,require('_process'))
},{"_process":1}],3:[function(require,module,exports){
'use strict';

/**
 * Analogue of Object.assign().
 * Copies properties from one or more source objects to
 * a target object. Existing keys on the target object will be overwritten.
 *
 * > Note: This differs from spec in some important ways:
 * > 1. Will throw if passed non-objects, including `undefined` or `null` values.
 * > 2. Does not support the curious Exception handling behavior, exceptions are thrown immediately.
 * > For more details, see:
 * > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 *
 *
 *
 * @param  {Object} target      The target object to copy properties to.
 * @param  {Object} source, ... The source(s) to copy properties from.
 * @return {Object}             The updated target object.
 */
module.exports = function fastAssign (target) {
  var totalArgs = arguments.length,
      source, i, totalKeys, keys, key, j;

  for (i = 1; i < totalArgs; i++) {
    source = arguments[i];
    keys = Object.keys(source);
    totalKeys = keys.length;
    for (j = 0; j < totalKeys; j++) {
      key = keys[j];
      target[key] = source[key];
    }
  }
  return target;
};

},{}],4:[function(require,module,exports){
(function (global){
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

var _rx = typeof window !== "undefined" ? window['Rx'] : typeof global !== "undefined" ? global['Rx'] : null;

var _rx2 = _interopRequireDefault(_rx);

var _obj = require('./obj');

var _obj2 = _interopRequireDefault(_obj);

var _parseHelpers = require('./parseHelpers');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var outputs = exports.outputs = ["geometry"]; //to be able to auto determine data type(s) fetched by parser
/**
 * @author mrdoob / http://mrdoob.com/
 * @author kaosat-dev
 */

var inputDataType = exports.inputDataType = "arrayBuffer"; //to be able to set required input data type

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
      var worker = new Worker(window.URL.createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n\tvalue: true\n});\nvar OBJ = function OBJ() {};\n\nOBJ.prototype = {\n\tconstructor: OBJ\n};\n\nOBJ.prototype.parseIndex = function (index, type) {\n\n\tindex = parseInt(index);\n\tvar dataArray = this.currentObject._attributes[type];\n\n\treturn index >= 0 ? index - 1 : index + dataArray.length;\n};\n\nOBJ.prototype._handle_face_line = function (rawData, rIndices, indices, type) {\n\tvar data = [];\n\n\tvar tmpIdx = [];\n\tfor (var i = 0; i < rIndices.length; i++) {\n\t\tvar idx = rIndices[i];\n\t\t//console.log(data[ idx ]);\n\t\t//data.push( parseInt( rawData[ idx] ) );\n\t\tdata.push(this.parseIndex(rawData[idx], type));\n\t}\n\n\tif (isNaN(data[3])) {\n\t\tindices.push(data[0], data[1], data[2]);\n\t\t//indices.push( this.parseIndex( data[ 0 ], type) , this.parseIndex( data[ 1 ], type) , this.parseIndex( data[ 2 ], type) );\n\t} else {\n\t\t\tindices.push(data[0], data[1], data[3], data[1], data[2], data[3]);\n\t\t}\n};\n\nOBJ.prototype._newObject = function () {\n\tvar currentObject = {};\n\tcurrentObject._attributes = {};\n\tcurrentObject._attributes["position"] = [];\n\tcurrentObject._attributes["normal"] = [];\n\tcurrentObject._attributes["uv"] = [];\n\tcurrentObject._attributes["indices"] = [];\n\tcurrentObject.faceCount = 0;\n\treturn currentObject;\n};\n\nOBJ.prototype.getData = function (text) {\n\tvar vertex_pattern = /v( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t// vn float float float\n\tvar normal_pattern = /vn( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t// vt float float\n\tvar uv_pattern = /vt( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t// f vertex vertex vertex ...\n\tvar face_pattern1 = /f( +\\d+)( +\\d+)( +\\d+)( +\\d+)?/;\n\t// f vertex/uv vertex/uv vertex/uv ...\n\tvar face_pattern2 = /f( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))?/;\n\t// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...\n\tvar face_pattern3 = /f( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))?/;\n\t// f vertex//normal vertex//normal vertex//normal ...\n\tvar face_pattern4 = /f( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))?/;\n\n\ttext = text.replace(/\\\\\\r\\n/g, \'\'); // handles line continuations\n\tvar lines = text.split(\'\\n\');\n\n\tvar vertices = [];\n\tvar normals = [];\n\tvar uvs = [];\n\tvar indices = [];\n\tvar normIndices = [];\n\tvar uvIndices = [];\n\n\tvar faceCount = 0;\n\tvar face_offset = 0;\n\n\tvar defaultNormal = [1, 1, 1];\n\tvar defaultUv = [0, 0];\n\n\tvar objects = [];\n\tvar textures = {};\n\tvar materials = {};\n\n\tvar currentObject = this._newObject();\n\tthis.currentObject = currentObject;\n\tvar currentMaterial = {};\n\n\tvertices = currentObject._attributes["position"];\n\tnormals = currentObject._attributes["normal"];\n\tuvs = currentObject._attributes["uv"];\n\tindices = currentObject._attributes["indices"];\n\n\tfor (var i = 0; i < lines.length; i++) {\n\t\tvar line = lines[i];\n\t\tline = line.trim().toLowerCase(); //needed because of some "exponent" values in upper case\n\t\tvar result;\n\n\t\t//console.log(line);\n\n\t\tif (line.length === 0 || line.charAt(0) === \'#\') {\n\t\t\tcontinue;\n\t\t} else if ((result = vertex_pattern.exec(line)) !== null) {\n\t\t\t// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]\n\t\t\tvertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));\n\t\t} else if ((result = normal_pattern.exec(line)) !== null) {\n\t\t\t// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]\n\t\t\tnormals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));\n\t\t} else if ((result = uv_pattern.exec(line)) !== null) {\n\t\t\t// ["vt 0.1 0.2", "0.1", "0.2"]\n\t\t\tuvs.push(parseFloat(result[1]), parseFloat(result[2]));\n\t\t} else if ((result = face_pattern1.exec(line)) !== null) {\n\t\t\t// ["f 1 2 3", "1", "2", "3", undefined]\n\t\t\t//console.log("result v1");\n\t\t\tthis._handle_face_line(result, [1, 2, 3, 4], indices, "position");\n\t\t\t//faces, uvs, normals_inds, geometry,face_offset, normals, uvs\n\t\t} else if ((result = face_pattern2.exec(line)) !== null) {\n\t\t\t\t// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]\n\t\t\t\t//console.log("result v2");\n\t\t\t\tthis._handle_face_line(result, [2, 5, 8, 11], indices, "position"); //2,5,8,11//possible winding order change of for some stuff11,8,5,2\n\t\t\t\tthis._handle_face_line(result, [3, 6, 9, 12], uvIndices, "uv");\n\t\t\t} else if ((result = face_pattern3.exec(line)) !== null) {\n\t\t\t\t// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]\n\t\t\t\t//console.log("result v3");\n\t\t\t\t//result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ]\n\t\t\t\tthis._handle_face_line(result, [2, 6, 10, 14], indices, "position"); //2,6,10,14\n\t\t\t\tthis._handle_face_line(result, [4, 8, 12, 16], normIndices, "normal");\n\t\t\t\tthis._handle_face_line(result, [3, 7, 11, 15], uvIndices, "uv");\n\t\t\t} else if ((result = face_pattern4.exec(line)) !== null) {\n\t\t\t\t//console.log("result v4");\n\t\t\t\t// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]\n\t\t\t\tthis._handle_face_line(result, [2, 5, 8, 11], indices, "position");\n\t\t\t\tthis._handle_face_line(result, [3, 6, 9, 12], normIndices, "normal");\n\t\t\t} else if (/^o /.test(line)) {\n\t\t\t\t// object\n\t\t\t\t//console.log("object")\n\t\t\t\tif (currentObject) {\n\t\t\t\t\t//if (!(geometry === undefined)) {\n\t\t\t\t\tface_offset = face_offset + vertices.length;\n\n\t\t\t\t\t//console.log("oldobject")\n\t\t\t\t\t//console.log( currentObject)\n\t\t\t\t\tcurrentObject.faceCount = indices.length;\n\n\t\t\t\t\t//reset all for next object\n\t\t\t\t\tcurrentObject = this._newObject();\n\t\t\t\t\tcurrentObject.name = line.substring(2).trim();\n\t\t\t\t\tvertices = currentObject._attributes["position"];\n\t\t\t\t\tnormals = currentObject._attributes["normal"];\n\t\t\t\t\tuvs = currentObject._attributes["uv"];\n\t\t\t\t\tindices = currentObject._attributes["indices"];\n\t\t\t\t\tnormIndices = currentObject._attributes["normIndices"];\n\t\t\t\t\tuvIndices = currentObject._attributes["uvIndices"];\n\n\t\t\t\t\tobjects.push(currentObject);\n\t\t\t\t}\n\t\t\t} else if (/^g /.test(line)) {\n\t\t\t\t// group\n\t\t\t\t//console.log("group");\n\t\t\t} else if (/^usemtl /.test(line)) {\n\t\t\t\t\t// material\n\t\t\t\t\tcurrentMaterial.name = line.substring(7).trim();\n\t\t\t\t} else if (/^mtllib /.test(line)) {\n\t\t\t\t\t// mtl file\n\t\t\t\t\tcurrentMaterial = {};\n\t\t\t\t} else if (/^s /.test(line)) {\n\t\t\t\t\t// smooth shading\n\t\t\t\t} else {\n\t\t\t\t\t\t// console.log( "OBJParser: Unhandled line " + line );\n\t\t\t\t\t}\n\t}\n\n\tif (objects.indexOf(currentObject) == -1) {\n\t\tobjects.push(currentObject);\n\t}\n\tcurrentObject.faceCount = indices.length / 3;\n\n\treturn {\n\t\tobjects: objects\n\t};\n};\n\n/*\n  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not\n*/\nOBJ.prototype._unindexData = function (object) {\n\tvar resultPositions = [];\n\tvar resultNormals = [];\n\tvar resultUv = [];\n\n\tvar vertices = object._attributes["position"];\n\tvar normals = object._attributes["normal"];\n\tvar uvs = object._attributes["uv"];\n\n\tfor (var i = 0; i < object.indices.length; i++) {\n\t\t//resultPositions.push( data. );\n\t}\n};\nexports.default = OBJ;\n\n},{}],2:[function(require,module,exports){\n\'use strict\';\n\nvar _obj = require(\'./obj\');\n\nvar _obj2 = _interopRequireDefault(_obj);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nself.onmessage = function (event) {\n\n  var data = event.data;\n  data = data.data;\n\n  var result = new _obj2.default().getData(data);\n\n  self.postMessage({ data: result });\n  self.close();\n};\n\n},{"./obj":1}]},{},[2])'], { type: "text/javascript" }))); //browserify

      worker.onmessage = function (event) {
        if ("data" in event.data) {
          var data = event.data.data;
          data.objects.forEach(function (modelData) {
            obs.onNext((0, _parseHelpers.createModelBuffers)(modelData));
          });
        } else if ("progress" in event.data) {
          //console.log("got progress", event.data.progress);
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
    });
  }
  return obs;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./obj":5,"./parseHelpers":6,"composite-detect":2,"fast.js/object/assign":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var OBJ = function OBJ() {};

OBJ.prototype = {
	constructor: OBJ
};

OBJ.prototype.parseIndex = function (index, type) {

	index = parseInt(index);
	var dataArray = this.currentObject._attributes[type];

	return index >= 0 ? index - 1 : index + dataArray.length;
};

OBJ.prototype._handle_face_line = function (rawData, rIndices, indices, type) {
	var data = [];

	var tmpIdx = [];
	for (var i = 0; i < rIndices.length; i++) {
		var idx = rIndices[i];
		//console.log(data[ idx ]);
		//data.push( parseInt( rawData[ idx] ) );
		data.push(this.parseIndex(rawData[idx], type));
	}

	if (isNaN(data[3])) {
		indices.push(data[0], data[1], data[2]);
		//indices.push( this.parseIndex( data[ 0 ], type) , this.parseIndex( data[ 1 ], type) , this.parseIndex( data[ 2 ], type) );
	} else {
			indices.push(data[0], data[1], data[3], data[1], data[2], data[3]);
		}
};

OBJ.prototype._newObject = function () {
	var currentObject = {};
	currentObject._attributes = {};
	currentObject._attributes["position"] = [];
	currentObject._attributes["normal"] = [];
	currentObject._attributes["uv"] = [];
	currentObject._attributes["indices"] = [];
	currentObject.faceCount = 0;
	return currentObject;
};

OBJ.prototype.getData = function (text) {
	var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
	// vn float float float
	var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
	// vt float float
	var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
	// f vertex vertex vertex ...
	var face_pattern1 = /f( +\d+)( +\d+)( +\d+)( +\d+)?/;
	// f vertex/uv vertex/uv vertex/uv ...
	var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/;
	// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
	var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;
	// f vertex//normal vertex//normal vertex//normal ...
	var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/;

	text = text.replace(/\\\r\n/g, ''); // handles line continuations
	var lines = text.split('\n');

	var vertices = [];
	var normals = [];
	var uvs = [];
	var indices = [];
	var normIndices = [];
	var uvIndices = [];

	var faceCount = 0;
	var face_offset = 0;

	var defaultNormal = [1, 1, 1];
	var defaultUv = [0, 0];

	var objects = [];
	var textures = {};
	var materials = {};

	var currentObject = this._newObject();
	this.currentObject = currentObject;
	var currentMaterial = {};

	vertices = currentObject._attributes["position"];
	normals = currentObject._attributes["normal"];
	uvs = currentObject._attributes["uv"];
	indices = currentObject._attributes["indices"];

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		line = line.trim().toLowerCase(); //needed because of some "exponent" values in upper case
		var result;

		//console.log(line);

		if (line.length === 0 || line.charAt(0) === '#') {
			continue;
		} else if ((result = vertex_pattern.exec(line)) !== null) {
			// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
			vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
		} else if ((result = normal_pattern.exec(line)) !== null) {
			// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
			normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
		} else if ((result = uv_pattern.exec(line)) !== null) {
			// ["vt 0.1 0.2", "0.1", "0.2"]
			uvs.push(parseFloat(result[1]), parseFloat(result[2]));
		} else if ((result = face_pattern1.exec(line)) !== null) {
			// ["f 1 2 3", "1", "2", "3", undefined]
			//console.log("result v1");
			this._handle_face_line(result, [1, 2, 3, 4], indices, "position");
			//faces, uvs, normals_inds, geometry,face_offset, normals, uvs
		} else if ((result = face_pattern2.exec(line)) !== null) {
				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
				//console.log("result v2");
				this._handle_face_line(result, [2, 5, 8, 11], indices, "position"); //2,5,8,11//possible winding order change of for some stuff11,8,5,2
				this._handle_face_line(result, [3, 6, 9, 12], uvIndices, "uv");
			} else if ((result = face_pattern3.exec(line)) !== null) {
				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
				//console.log("result v3");
				//result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ]
				this._handle_face_line(result, [2, 6, 10, 14], indices, "position"); //2,6,10,14
				this._handle_face_line(result, [4, 8, 12, 16], normIndices, "normal");
				this._handle_face_line(result, [3, 7, 11, 15], uvIndices, "uv");
			} else if ((result = face_pattern4.exec(line)) !== null) {
				//console.log("result v4");
				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
				this._handle_face_line(result, [2, 5, 8, 11], indices, "position");
				this._handle_face_line(result, [3, 6, 9, 12], normIndices, "normal");
			} else if (/^o /.test(line)) {
				// object
				//console.log("object")
				if (currentObject) {
					//if (!(geometry === undefined)) {
					face_offset = face_offset + vertices.length;

					//console.log("oldobject")
					//console.log( currentObject)
					currentObject.faceCount = indices.length;

					//reset all for next object
					currentObject = this._newObject();
					currentObject.name = line.substring(2).trim();
					vertices = currentObject._attributes["position"];
					normals = currentObject._attributes["normal"];
					uvs = currentObject._attributes["uv"];
					indices = currentObject._attributes["indices"];
					normIndices = currentObject._attributes["normIndices"];
					uvIndices = currentObject._attributes["uvIndices"];

					objects.push(currentObject);
				}
			} else if (/^g /.test(line)) {
				// group
				//console.log("group");
			} else if (/^usemtl /.test(line)) {
					// material
					currentMaterial.name = line.substring(7).trim();
				} else if (/^mtllib /.test(line)) {
					// mtl file
					currentMaterial = {};
				} else if (/^s /.test(line)) {
					// smooth shading
				} else {
						// console.log( "OBJParser: Unhandled line " + line );
					}
	}

	if (objects.indexOf(currentObject) == -1) {
		objects.push(currentObject);
	}
	currentObject.faceCount = indices.length / 3;

	return {
		objects: objects
	};
};

/*
  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not
*/
OBJ.prototype._unindexData = function (object) {
	var resultPositions = [];
	var resultNormals = [];
	var resultUv = [];

	var vertices = object._attributes["position"];
	var normals = object._attributes["normal"];
	var uvs = object._attributes["uv"];

	for (var i = 0; i < object.indices.length; i++) {
		//resultPositions.push( data. );
	}
};
exports.default = OBJ;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModelBuffers = createModelBuffers;
//TODO: potential candidate for re-use across parsers with a few changes
function createModelBuffers(modelData) {
  //console.log("creating model buffers",modelData, modelData._attributes)

  var faces = modelData.faceCount;
  var colorSize = 3;

  var positions = new Float32Array(faces * 3 * 3);
  var normals = new Float32Array(faces * 3 * 3);
  //let colors  = new Float32Array( faces *3 * colorSize )
  var indices = new Uint32Array(faces * 3);

  //vertices.set( modelData.position );
  //normals.set( modelData.normal );
  //indices.set( modelData.indices );

  positions.set(modelData._attributes.position);
  normals.set(modelData._attributes.normal);
  indices.set(modelData._attributes.indices);

  //materials = []
  return { positions: positions, indices: indices, normals: normals };
}

/*
OBJParser.prototype._parse = function( text )
{
  var object = new THREE.Object3D();
  var geometry, material, mesh;
  var face_offset = 0;

  // create mesh if no objects in text
  if ( /^o /gm.test( text ) === false ) {

    geometry = new THREE.Geometry();
    material = new THREE.MeshLambertMaterial();
    mesh = new THREE.Mesh( geometry, material );
    object.add( mesh );

  }

    var vertices = [];
    var verticesCount = 0;
    var normals = [];
    var uvs = [];
    // v float float float
    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    // vn float float float
    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    // vt float float
    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    // f vertex vertex vertex ...
    var face_pattern1 = /f( +\d+)( +\d+)( +\d+)( +\d+)?/;
    // f vertex/uv vertex/uv vertex/uv ...
    var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/;
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
    var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;
    // f vertex//normal vertex//normal vertex//normal ...
    var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/

    var lines = text.split( '\n' );

    for ( var i = 0; i < lines.length; i ++ ) {
      var line = lines[ i ];
      line = line.trim();
      var result;

      if ( line.length === 0 || line.charAt( 0 ) === '#' ) {
        continue;
      } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {
        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
        geometry.vertices.push( vector(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] ),
          parseFloat( result[ 3 ] )
        ) );
      } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {
        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
        normals.push( vector(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] ),
          parseFloat( result[ 3 ] )
        ) );
      } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {
        // ["vt 0.1 0.2", "0.1", "0.2"]
        uvs.push( uv(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] )
        ) );
      } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {
        // ["f 1 2 3", "1", "2", "3", undefined]
        handle_face_line([ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ], geometry,face_offset, normals, uvs);
      } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {
        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
        handle_face_line(
          [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
          [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
          , geometry, face_offset, normals, uvs
        );
      } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {
        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
        handle_face_line(
          [ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
          [ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
          [ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
          , geometry, face_offset, normals, uvs
        );
      } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {
        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
        handle_face_line(
          [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
          [ ], //uv
          [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
          , geometry, face_offset, normals, uvs
        );

      } else if ( /^o /.test( line ) ) {
        // object
        if (!(geometry === undefined)) {
          face_offset = face_offset + geometry.vertices.length;
        }

        geometry = new THREE.Geometry();
        material = new THREE.MeshLambertMaterial();

        mesh = new THREE.Mesh( geometry, material );
        mesh.name = line.substring( 2 ).trim();
        object.add( mesh );

        verticesCount = 0;

      } else if ( /^g /.test( line ) ) {
        // group
      } else if ( /^usemtl /.test( line ) ) {
        // material
        material.name = line.substring( 7 ).trim();
      } else if ( /^mtllib /.test( line ) ) {
        // mtl file
      } else if ( /^s /.test( line ) ) {
        // smooth shading
      } else {
        // console.log( "OBJParser: Unhandled line " + line );
      }
    }

    for ( var i = 0, l = object.children.length; i < l; i ++ ) {
      var geometry = object.children[ i ].geometry;
    }

    return object;
}


    function vector( x, y, z ) {
      return new THREE.Vector3( x, y, z );
    }

    function uv( u, v ) {
      return new THREE.Vector2( u, v );
    }

    function face3( a, b, c, normals ) {
      return new THREE.Face3( a, b, c, normals );
    }


    function add_face( a, b, c, normals_inds, geometry ,face_offset, normals) {
      if ( normals_inds === undefined ) {
        geometry.faces.push( face3(
          parseInt( a ) - (face_offset + 1),
          parseInt( b ) - (face_offset + 1),
          parseInt( c ) - (face_offset + 1)
        ) );
      } else {
        geometry.faces.push( face3(
          parseInt( a ) - (face_offset + 1),
          parseInt( b ) - (face_offset + 1),
          parseInt( c ) - (face_offset + 1),
          [
            normals[ parseInt( normals_inds[ 0 ] ) - 1 ].clone(),
            normals[ parseInt( normals_inds[ 1 ] ) - 1 ].clone(),
            normals[ parseInt( normals_inds[ 2 ] ) - 1 ].clone()
          ]
        ) );
      }
    }

    function add_uvs( a, b, c, geometry , uvs) {
      geometry.faceVertexUvs[ 0 ].push( [
        uvs[ parseInt( a ) - 1 ].clone(),
        uvs[ parseInt( b ) - 1 ].clone(),
        uvs[ parseInt( c ) - 1 ].clone()
      ] );
    }

    function handle_face_line(faces, uvs, normals_inds, geometry,face_offset, normals, uvs) {
      if ( faces[ 3 ] === undefined ) {
        add_face( faces[ 0 ], faces[ 1 ], faces[ 2 ], normals_inds, geometry,face_offset, normals );
        if (!(uvs === undefined) && uvs.length > 0) {
          add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 2 ] , geometry , uvs);
        }
      } else {
        if (!(normals_inds === undefined) && normals_inds.length > 0) {
          add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ], [ normals_inds[ 0 ], normals_inds[ 1 ], normals_inds[ 3 ] ], geometry,face_offset, normals);
          add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ], [ normals_inds[ 1 ], normals_inds[ 2 ], normals_inds[ 3 ] ], geometry,face_offset, normals);
        } else {
          add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ], geometry,face_offset, normals);
          add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ], geometry,face_offset, normals);
        }
        if (!(uvs === undefined) && uvs.length > 0) {
          add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 3 ] , geometry,face_offset, normals);
          add_uvs( uvs[ 1 ], uvs[ 2 ], uvs[ 3 ] , geometry,face_offset, normals);
        }
      }
    }*/

},{}]},{},[4])(4)
});