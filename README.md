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

    browserify obj-parser.js -r ./obj-parser.js:obj-parser -o lib/obj-parser.js -x composite-detect -x three

then replace (manually for now) all following entries in the generated file:

  "composite-detect":"awZPbp","three":"Wor+Zu"

with the correct module names, ie:

   "composite-detect":"composite-detect","three":"three"
