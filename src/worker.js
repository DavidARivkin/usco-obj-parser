var OBJ = require("./obj.js");

self.onmessage = function( event ) {
  var data = event.data;
  data = data.data;

  var result = new OBJ().getData( data );
  
  self.postMessage( {data:result} );
	self.close();

}
