obj format parser for USCO project, based on THREE.js obj parser

General information
-------------------
This repository contains both the:
- node.js version:
obj-parser.js at the root of the project
- polymer.js/browser version which is a combo of
lib/obj-parser.js (browserified version of the above)
obj-parser.html


How to generate browser/polymer.js version (with require support):
------------------------------------------------------------------
Type:

      grunt build-browser-lib

This will generate the correct browser(ified) version of the source in the lib folder

TODO:
 - [ ] full attributes support (normals, uvs)
