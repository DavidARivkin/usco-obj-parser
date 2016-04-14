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