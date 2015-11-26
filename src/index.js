/**
 * @author mrdoob / http://mrdoob.com/
 * @author kaosat-dev
 */

import detectEnv from 'composite-detect'
import assign from 'fast.js/object/assign'
import Rx from 'rx'

import OBJ from './obj'

import {ensureArrayBuffer} from './utils'
import {createModelBuffers} from './parseHelpers'
//import {parseSteps} from './parseHelpers'

export const outputs = ["geometry"] //to be able to auto determine data type(s) fetched by parser
export const inputDataType = "arrayBuffer" //to be able to set required input data type 

// Load CTM compressed models
export default function parse(data, parameters={}){

  const defaults = {
    useWorker: (detectEnv.isBrowser===true)
    ,offsets: [0]
  }
  parameters = assign({},defaults,parameters)

  const {useWorker, offsets} = parameters
  const obs = new Rx.ReplaySubject(1)


}


OBJParser = function ( manager ) {
  this.defaultMaterialType = THREE.MeshPhongMaterial;//THREE.MeshLambertMaterial; //
	this.defaultColor = new THREE.Color( "#efefff" );
  this.recomputeNormals = true;
};



OBJParser.prototype.parse = function (data, parameters) {
  var parameters = parameters || {};

  var deferred = Q.defer();
  var rootObject = new THREE.Object3D();
	var self = this;

  function postProcess( data )
  {
      for(var i=0;i<data.objects.length;i++)
      {
        var modelData = data.objects[i];
        var model = self.createModelBuffers( modelData );
			  rootObject.add( model );
      }
  }

	if ( useWorker ) {
	  var worker = new Worker( "./obj-worker.js" );
		worker.onmessage = function( event ) {
		  if("data" in event.data)
		  {
		    var data = event.data.data;
		    console.log("data recieved in main thread", data);
		    //var model = self.createModelBuffers( data );
        postProcess( data );
        deferred.resolve( rootObject );
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
    postProcess( data );
    deferred.resolve( rootObject );
	}

  return deferred;
}

//TODO: potential candidate for re-use across parsers
OBJParser.prototype.createModelBuffers = function ( modelData ) {
  console.log("creating model buffers",modelData, "faces",modelData.faceCount);

  var faces = modelData.faceCount;
  var colorSize =3;

  var vertices = new Float32Array( faces * 3 * 3 );
	var normals = new Float32Array( faces * 3 * 3 );
	//var colors = new Float32Array( faces *3 * colorSize );
	var indices = new Uint32Array( faces * 3  );

	/*vertices.set( modelData.position );
	normals.set( modelData.normal );
	indices.set( modelData.indices );*/

  vertices.set( modelData._attributes.position );
	normals.set( modelData._attributes.normal );
	indices.set( modelData._attributes.indices );

}




  var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
  geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );

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
  var material = new this.defaultMaterialType({color:color, specular: 0xffffff, shininess: 2, shading: THREE.FlatShading});//,vertexColors: THREE.VertexColors
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
