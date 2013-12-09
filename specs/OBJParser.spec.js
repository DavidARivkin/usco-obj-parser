OBJParser = require("../OBJParser");
THREE = require("three");
fs = require("fs");

describe("OBJ parser tests", function() {
  var parser = new OBJParser();
  
  it("can parse obj files", function() {
    data = fs.readFileSync("specs/data/box.obj",'binary')
    parsedObj = parser.parse(data);
    expect(parsedObj instanceof THREE.Object3D).toBe(true);
    expect(parsedObj.children[0].geometry.vertices.length).toEqual(8);
  });
  
});
