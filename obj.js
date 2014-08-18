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
