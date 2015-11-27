import OBJ from './obj'

self.onmessage = function( event ) {
  
  let data = event.data
  data = data.data

  let result = new OBJ().getData( data )
  
  self.postMessage( {data:result} )
	self.close()

}
