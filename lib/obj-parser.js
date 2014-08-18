require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"ZAdffB":[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 * @author kaosat-dev
 */
var detectEnv = require("composite-detect");

if(detectEnv.isNode) var THREE = require("three");
if(detectEnv.isBrowser) var THREE = window.THREE;
if(detectEnv.isModule) var Q = require('q');

var OBJ = require("./obj.js");

OBJParser = function ( manager ) {
  this.defaultMaterialType = THREE.MeshPhongMaterial;//THREE.MeshLambertMaterial; //
	this.defaultColor = new THREE.Color( "#efefff" );
  this.recomputeNormals = true;
};

OBJParser.prototype = {
	constructor: OBJParser
};

OBJParser.prototype.parse = function (data, parameters) {
  var parameters = parameters || {};
  var useBuffers = parameters.useBuffers !== undefined ? parameters.useBuffers : true;
  var useWorker = parameters.useWorker !== undefined ?  parameters.useWorker && detectEnv.isBrowser: true;

  var deferred = Q.defer();
	var self = this;

	if ( useWorker ) {
	  var worker = new Worker((window.webkitURL || window.URL).createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\nvar OBJ = require("./obj.js");\n\nself.onmessage = function( event ) {\n  var data = event.data;\n  data = data.data;\n\n  var result = new OBJ().getData( data );\n  \n  self.postMessage( {data:result} );\n\tself.close();\n\n}\n\n},{"./obj.js":2}],2:[function(require,module,exports){\nvar OBJ = function () {\n\n}\n\nOBJ.prototype._handle_face_line =function( data, rIndices, indices )\n{\n  var tmpIdx = [];\n  for(var i=0;i<rIndices.length;i++)\n  {\n    var idx = rIndices[i];\n    tmpIdx.push( parseInt(data[ idx ]) -1 );\n  }\n  if ( data[ 3 ] === undefined ) {\n    indices.push( tmpIdx[0],tmpIdx[1],tmpIdx[3] );\n  }\n  else\n  {\n    indices.push( tmpIdx[0],tmpIdx[1],tmpIdx[3], tmpIdx[1],tmpIdx[2],tmpIdx[3] );\n  }\n}\n\nOBJ.prototype.getData = function(text)\n{\n  \tvar vertex_pattern = /v( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t\t// vn float float float\n\t\tvar normal_pattern = /vn( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t\t// vt float float\n\t\tvar uv_pattern = /vt( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t\t// f vertex vertex vertex ...\n\t\tvar face_pattern1 = /f( +\\d+)( +\\d+)( +\\d+)( +\\d+)?/;\n\t\t// f vertex/uv vertex/uv vertex/uv ...\n\t\tvar face_pattern2 = /f( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))?/;\n\t\t// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...\n\t\tvar face_pattern3 = /f( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))?/;\n\t\t// f vertex//normal vertex//normal vertex//normal ...\n\t\tvar face_pattern4 = /f( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))?/\n\n\n\t\ttext = text.replace( /\\\\\\r\\n/g, \'\' ); // handles line continuations\n\t\tvar lines = text.split( \'\\n\' );\n\n\n\t\tvar vertices = [];\n\t\tvar normals  = [];\n\t\tvar uvs      = [];\n\t\tvar indices  = [];\n\t\tvar normIndices = [];\n\t\tvar uvIndices = [];\n\t\tvar faceCount = 0;\n\n    var objects = [];\n    var currentObject = {};\n    var currentMaterial = {};\n\n\t\tfor ( var i = 0; i < lines.length; i ++ ) {\n\t\t\tvar line = lines[ i ];\n\t\t\tline = line.trim();\n\t\t\tvar result;\n\n\t\t\tif ( line.length === 0 || line.charAt( 0 ) === \'#\' ) {\n\t\t\t\tcontinue;\n\t\t\t} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {\n\t\t\t\t// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]\n\t\t\t\tvertices.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ));\n\t\t\t} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {\n\t\t\t\t// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]\n\t\t\t\tnormals.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ));\n\t\t\t} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {\n\t\t\t\t// ["vt 0.1 0.2", "0.1", "0.2"]\n\t\t\t\tuvs.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ) );\n\t\t\t} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {\n\t\t\t\t// ["f 1 2 3", "1", "2", "3", undefined]\n\t\t\t\t//console.log("result v1");\n\t\t\t\tthis._handle_face_line(result,[1,2,3,4], indices );\n\t\t\t\t//faces, uvs, normals_inds, geometry,face_offset, normals, uvs\n\t\t\t} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {\n\t\t\t\t// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]\n\t\t\t\t//console.log("result v2");\n\t\t\t\tthis._handle_face_line(result,[2,5,8,11], indices );//2,5,8,11//possible winding order change of for some stuff11,8,5,2\n\t\t\t\tthis._handle_face_line(result,[3,6,9,12], uvIndices );\n\t\t\t} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {\n\t\t\t\t// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]\n\t\t\t\t//console.log("result v3");\n\t\t\t\tthis._handle_face_line(result,[2,6,10,14], indices );//2,6,10,14\n\t\t\t\tthis._handle_face_line(result,[4,8,12,16], normIndices );\n\t\t\t\tthis._handle_face_line(result,[3,7,11,15], uvIndices );\n\t\t\t} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {\n\t\t\t\t// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]\n\t\t\t\tthis._handle_face_line(result,[2,5,8,11], indices );\n\t\t\t\tthis._handle_face_line(result,[3,6,9,12], normIndices );\n\t\t\t} else if ( /^o /.test( line ) ) {\n\t\t\t\t// object\n\t\t\t\tconsole.log("object")\n\t\t\t\tif (!(geometry === undefined)) {\n\t\t\t\t\tface_offset = face_offset + vertices.length;\n\t\t\t\t}\n\n        currentMaterial = {};\n        currentObject = {};\n        currentObject.name = line.substring( 2 ).trim();\n\t\t\t\tobjects.push( currentObject );\n\n\t\t\t\tverticesCount = 0;\n\n\t\t\t} else if ( /^g /.test( line ) ) {\n\t\t\t\t// group\n\t\t\t\tconsole.log("group");\n\t\t\t} else if ( /^usemtl /.test( line ) ) {\n\t\t\t\t// material\n        currentMaterial.name = line.substring( 7 ).trim();\n\t\t\t} else if ( /^mtllib /.test( line ) ) {\n\t\t\t\t// mtl file\n\t\t\t} else if ( /^s /.test( line ) ) {\n\t\t\t\t// smooth shading\n\t\t\t} else {\n\t\t\t\t// console.log( "OBJParser: Unhandled line " + line );\n\t\t\t}\n\t\t}\n\n\t\treturn {\n\t\t  position :vertices,\n\t\t  normal   :normals,\n\t\t  uvs       :uvs,\n\t\t  indices   :indices,\n\t\t  faceCount: indices.length/3\n\t\t}\n}\n\n/*\n  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not\n*/\nOBJ.prototype._unindexData=function( data )\n{\n  var resultPositions = [];\n  var resultNormals = [];\n  var resultUv      = [];\n\n  for(var i=0;i<data.indices.length;i++)\n  {\n    \n  }\n}\n\nmodule.exports = OBJ;\n\n},{}]},{},[1])'],{type:"text/javascript"})));
		worker.onmessage = function( event ) {
		  if("data" in event.data)
		  {
		    var data = event.data.data;
		    console.log("data recieved in main thread", data);
		    var model = self.createModelBuffers( data );
        deferred.resolve( model );
      }
      else if("progress" in event.data)
      {
        console.log("got progress", event.data.progress);
        deferred.notify( {"parsing":event.data.progress} )
      }
		}
		worker.postMessage( {data:data});
		Q.catch( deferred.promise, function(){
		  worker.terminate()
		});
	}
	else
	{
	  data = new OBJ().getData( data );
	  console.log("raw data", data);
	  data = this.createModelBuffers( data );
	  deferred.resolve( data );
	}

  return deferred;
}

//TODO: potential candidate for re-use across parsers
OBJParser.prototype.createModelBuffers = function ( modelData ) {
  console.log("creating model buffers",modelData);

  var faces = modelData.faceCount;
  var colorSize =3;

  var vertices = new Float32Array( faces * 3 * 3 );
	var normals = new Float32Array( faces * 3 * 3 );
	var colors = new Float32Array( faces *3 * colorSize );
	var indices = new Uint32Array( faces * 3  );

	vertices.set( modelData.position );
	normals.set( modelData.normal );
	indices.set( modelData.indices );
	//colors.set( modelData.vcolors );

  var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
  geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
  //geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, colorSize ) );

  if(this.recomputeNormals)
  {
    console.log("fooNormals");
    //TODO: only do this, if no normals were specified???
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  }

  /*var vs = require('./vertShader.vert')();
  var fs = require('./fragShader.frag')();

  var material = new THREE.RawShaderMaterial( {

					uniforms: {
						time: { type: "f", value: 1.0 }
					},
					vertexShader: vs,
					fragmentShader: fs,
					side: THREE.DoubleSide,
					transparent: true

				} );*/
  var color = this.defaultColor;
  var material = new this.defaultMaterialType({color:color, specular: 0xffffff, shininess: 10, shading: THREE.FlatShading});//,vertexColors: THREE.VertexColors
  var mesh = new THREE.Mesh( geometry, material );
  return mesh
}


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
		}

if (detectEnv.isModule) module.exports = OBJParser;

},{"./obj.js":3,"composite-detect":false,"three":false}],"obj-parser":[function(require,module,exports){
module.exports=require('ZAdffB');
},{}],3:[function(require,module,exports){
var OBJ = function () {

}

OBJ.prototype._handle_face_line =function( data, rIndices, indices )
{
  var tmpIdx = [];
  for(var i=0;i<rIndices.length;i++)
  {
    var idx = rIndices[i];
    tmpIdx.push( parseInt(data[ idx ]) -1 );
  }
  if ( data[ 3 ] === undefined ) {
    indices.push( tmpIdx[0],tmpIdx[1],tmpIdx[3] );
  }
  else
  {
    indices.push( tmpIdx[0],tmpIdx[1],tmpIdx[3], tmpIdx[1],tmpIdx[2],tmpIdx[3] );
  }
}

OBJ.prototype.getData = function(text)
{
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


		text = text.replace( /\\\r\n/g, '' ); // handles line continuations
		var lines = text.split( '\n' );


		var vertices = [];
		var normals  = [];
		var uvs      = [];
		var indices  = [];
		var normIndices = [];
		var uvIndices = [];
		var faceCount = 0;

    var objects = [];
    var currentObject = {};
    var currentMaterial = {};

		for ( var i = 0; i < lines.length; i ++ ) {
			var line = lines[ i ];
			line = line.trim();
			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {
				continue;
			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {
				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
				vertices.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ));
			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {
				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
				normals.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ));
			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {
				// ["vt 0.1 0.2", "0.1", "0.2"]
				uvs.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ) );
			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {
				// ["f 1 2 3", "1", "2", "3", undefined]
				//console.log("result v1");
				this._handle_face_line(result,[1,2,3,4], indices );
				//faces, uvs, normals_inds, geometry,face_offset, normals, uvs
			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {
				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
				//console.log("result v2");
				this._handle_face_line(result,[2,5,8,11], indices );//2,5,8,11//possible winding order change of for some stuff11,8,5,2
				this._handle_face_line(result,[3,6,9,12], uvIndices );
			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {
				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
				//console.log("result v3");
				this._handle_face_line(result,[2,6,10,14], indices );//2,6,10,14
				this._handle_face_line(result,[4,8,12,16], normIndices );
				this._handle_face_line(result,[3,7,11,15], uvIndices );
			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {
				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
				this._handle_face_line(result,[2,5,8,11], indices );
				this._handle_face_line(result,[3,6,9,12], normIndices );
			} else if ( /^o /.test( line ) ) {
				// object
				console.log("object")
				if (!(geometry === undefined)) {
					face_offset = face_offset + vertices.length;
				}

        currentMaterial = {};
        currentObject = {};
        currentObject.name = line.substring( 2 ).trim();
				objects.push( currentObject );

				verticesCount = 0;

			} else if ( /^g /.test( line ) ) {
				// group
				console.log("group");
			} else if ( /^usemtl /.test( line ) ) {
				// material
        currentMaterial.name = line.substring( 7 ).trim();
			} else if ( /^mtllib /.test( line ) ) {
				// mtl file
			} else if ( /^s /.test( line ) ) {
				// smooth shading
			} else {
				// console.log( "OBJParser: Unhandled line " + line );
			}
		}

		return {
		  position :vertices,
		  normal   :normals,
		  uvs       :uvs,
		  indices   :indices,
		  faceCount: indices.length/3
		}
}

/*
  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not
*/
OBJ.prototype._unindexData=function( data )
{
  var resultPositions = [];
  var resultNormals = [];
  var resultUv      = [];

  for(var i=0;i<data.indices.length;i++)
  {
    
  }
}

module.exports = OBJ;

},{}]},{},["ZAdffB"])