var OBJ = function () {
}

OBJ.prototype = {
  constructor: OBJ
}

OBJ.prototype.parseIndex = function( index, type ) {

			index = parseInt( index );
      var dataArray = this.currentObject._attributes[type];
      
			return index >= 0 ? index - 1 : index + dataArray.length;
}

OBJ.prototype._handle_face_line =function( rawData, rIndices, indices, type )
{
  var data = [];
  
  var tmpIdx = [];
  for(var i=0;i<rIndices.length;i++)
  {
    var idx = rIndices[i];
    //console.log(data[ idx ]);
    //data.push( parseInt( rawData[ idx] ) );
    data.push( this.parseIndex( rawData[ idx ], type) );
  }
  
  if ( isNaN( data[ 3 ] ) ) {
    indices.push( data[0],data[1],data[2] );
    //indices.push( this.parseIndex( data[ 0 ], type) , this.parseIndex( data[ 1 ], type) , this.parseIndex( data[ 2 ], type) ); 
  }
  else
  {
    indices.push( data[0],data[1],data[3], data[1],data[2],data[3] );
  }
}

OBJ.prototype._newObject = function ()
{
  var currentObject = {};
  currentObject._attributes =  {};
  currentObject._attributes["position"] = [];
  currentObject._attributes["normal"] = [];
  currentObject._attributes["uv"] = [];
  currentObject._attributes["indices"] = [];
  currentObject.faceCount = 0;
  return currentObject;
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

		var faceCount  = 0;
    var face_offset= 0;

    var defaultNormal = [1,1,1];
    var defaultUv     = [0,0]

    var objects = [];
    var textures = {};
    var materials = {};

    var currentObject = this._newObject();
    this.currentObject = currentObject;
    var currentMaterial = {};

    vertices = currentObject._attributes["position"];
    normals = currentObject._attributes["normal"];
    uvs =currentObject._attributes["uv"];
    indices = currentObject._attributes["indices"];

		for ( var i = 0; i < lines.length; i ++ ) {
			var line = lines[ i ];
			line = line.trim().toLowerCase();//needed because of some "exponent" values in upper case
			var result;

      //console.log(line);
      
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
				this._handle_face_line(result,[1,2,3,4], indices , "position" );
				//faces, uvs, normals_inds, geometry,face_offset, normals, uvs
			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {
				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
				//console.log("result v2");
				this._handle_face_line(result,[2,5,8,11], indices,  "position"  );//2,5,8,11//possible winding order change of for some stuff11,8,5,2
				this._handle_face_line(result,[3,6,9,12], uvIndices ,"uv" );
			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {
				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
				//console.log("result v3");
				//result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ]
				this._handle_face_line(result,[2,6,10,14], indices, "position" );//2,6,10,14
				this._handle_face_line(result,[4,8,12,16], normIndices, "normal" );
				this._handle_face_line(result,[3,7,11,15], uvIndices, "uv" );
			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {
			  //console.log("result v4");
				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
				this._handle_face_line(result,[2,5,8,11], indices,  "position"  );
				this._handle_face_line(result,[3,6,9,12], normIndices, "normal" );
			} else if ( /^o /.test( line ) ) {
				// object
				//console.log("object")
				if(currentObject){//if (!(geometry === undefined)) {
					face_offset = face_offset + vertices.length;

          console.log("oldobject")
          console.log( currentObject)
          currentObject.faceCount = indices.length;

          //reset all for next object
          currentObject = this._newObject();
          currentObject.name = line.substring( 2 ).trim();
          vertices = currentObject._attributes["position"];
          normals = currentObject._attributes["normal"];
          uvs =currentObject._attributes["uv"];
          indices = currentObject._attributes["indices"];
          normIndices = currentObject._attributes["normIndices"];
          uvIndices = currentObject._attributes["uvIndices"];

          objects.push( currentObject );
				}

			} else if ( /^g /.test( line ) ) {
				// group
				console.log("group");
			} else if ( /^usemtl /.test( line ) ) {
				// material
        currentMaterial.name = line.substring( 7 ).trim();
			} else if ( /^mtllib /.test( line ) ) {
				// mtl file
        currentMaterial = {};
			} else if ( /^s /.test( line ) ) {
				// smooth shading
			} else {
				// console.log( "OBJParser: Unhandled line " + line );
			}
		}

    if(objects.indexOf(currentObject)==-1)
    {
        objects.push( currentObject );
    }
    currentObject.faceCount = indices.length/3;

		return {
      objects:objects
		}
}

/*
  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not
*/
OBJ.prototype._unindexData=function( object )
{
  var resultPositions = [];
  var resultNormals = [];
  var resultUv      = [];

  var vertices = object._attributes["position"];
  var normals = object._attributes["normal"];
  var uvs =object._attributes["uv"];

  for(var i=0;i<object.indices.length;i++)
  {
      //resultPositions.push( data. );
  }
}
export default OBJ
