## Usco-obj-parser

[![GitHub version](https://badge.fury.io/gh/usco%2Fusco-obj-parser.svg)](https://badge.fury.io/gh/usco%2Fusco-obj-parser)

obj format parser for USCO project

originally based on THREE.js CTM parser, but rather extensively modified.
(not dependenant, or using three.js anymore)

Optimized for speed in the browser (webworkers etc)



## General information

  - returns raw buffer data wrapped in an RxJs observable (soon to be most.js)
  - useable both on Node.js & client side 


## Usage 

  
          import parse,  {outputs} from '../lib/obj-parser'

          let data = fs.readFileSync("mesh.obj",'binary')

          let objObs = parse(data) //we get an observable back

          objObs.forEach(function(parsedGeometry){
            //DO what you want with the data wich is something like {vertices,normals,etc}
            console.log(parsedGeometry) 
          })

## TODO:

 - [ ] full attributes support (normals, uvs)

## LICENSE

[The MIT License (MIT)](https://github.com/usco/usco-obj-parser/blob/master/LICENSE)

- - -

[![Build Status](https://travis-ci.org/usco/usco-obj-parser.svg?branch=master)](https://travis-ci.org/usco/usco-obj-parser)
[![Dependency Status](https://david-dm.org/usco/usco-obj-parser.svg)](https://david-dm.org/usco/usco-obj-parser)
[![devDependency Status](https://david-dm.org/usco/usco-obj-parser/dev-status.svg)](https://david-dm.org/usco/usco-obj-parser#info=devDependencies)



