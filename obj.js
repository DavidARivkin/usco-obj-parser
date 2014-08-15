var OBJ = function () {

}

OBJ.prototype._handle_face_line =function( data, rIndices, indices, faceCount )
{
  var indexDataLen = 0;
  var tmpIdx = [];
  for(var i=0;i<rIndices.length;i++)
  {
    var idx = rIndices[i];
    tmpIdx.push( parseInt(data[ idx ]) -1 );
  }
  if ( data[ 3 ] === undefined ) {
    indexDataLen = 3;
    indices.push( tmpIdx[0],tmpIdx[1],tmpIdx[3] );
    faceCount+=1;
  }
  else
  {
    indexDataLen = 4;
    faceCount+=2;
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
				console.log("result v1", result);
				this._handle_face_line(result,[1,2,3,4], indices, faceCount );
				//0,1,3 --> 1,2,4
				//1,2,3 --> 2,3,4
				//handle_face_line([ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ], geometry);
				//faces, uvs, normals_inds, geometry,face_offset, normals, uvs
			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {
				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
				//indices.push( result[ 2 ], result[ 5 ], result[ 8 ] );
				uvIndices.push( result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] );
				//console.log("result v2");
				/*handle_face_line(
					[ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
					[ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
					, geometry, face_offset, normals, uvs
				);*/
				this._handle_face_line(result,[2,5,8,11], indices, faceCount );
				
			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {
				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
				//console.log("result v3");
				uvIndices.push( result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] );
				normIndices.push(  result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] );
				
				//var tmpIdx = [parseInt(result[ 2 ])-1, parseInt(result[ 6 ])-1, parseInt(result[ 10 ])-1, parseInt(result[ 14 ])-1];
				//indices.push( tmpIdx[0],tmpIdx[1],tmpIdx[3], tmpIdx[1],tmpIdx[2],tmpIdx[3] );
				
				this._handle_face_line(result,[2,6,10,14], indices, faceCount );
				
				/*handle_face_line(
					[ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
					[ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
					[ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
					, geometry, face_offset, normals, uvs
				);*/
				
			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {
				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
				/*handle_face_line(
					[ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
					[ ], //uv
					[ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
					, geometry, face_offset, normals, uvs
				);*/
				indices.push( result[ 2 ], result[ 5 ], result[ 8 ] );

			} else if ( /^o /.test( line ) ) {
				// object
				/*if (!(geometry === undefined)) {
					face_offset = face_offset + geometry.vertices.length;
				}
				
				geometry = new THREE.Geometry();
				material = new THREE.MeshLambertMaterial();

				mesh = new THREE.Mesh( geometry, material );
				mesh.name = line.substring( 2 ).trim();
				object.add( mesh );

				verticesCount = 0;*/

			} else if ( /^g /.test( line ) ) {
				// group
			} else if ( /^usemtl /.test( line ) ) {
				// material
				//TODO: fix thismaterial.name = line.substring( 7 ).trim();
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

module.exports = OBJ;
