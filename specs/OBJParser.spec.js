import assert from 'assert'
import fs from 'fs'

// these two are needed by the parser
import Rx from 'rx'
import assign from 'fast.js/object/assign'

import parse, { outputs } from '../src/index'

describe('OBJ parser tests', () => {

  it('can parse obj files', function (done) {
    this.timeout(10000)
    let data = fs.readFileSync('specs/data/box.obj', 'binary')
    let obs = parse(data) // we get an observable back

    obs
      // tap(e => console.log('data', e) )
      .filter(data => (!data.hasOwnProperty('progress'))) // filter out progress information
      .forEach(function (parsedGeometry) {
        assert.equal(parsedGeometry.indices.length, 36)
        assert.equal(parsedGeometry.positions.length, 108)
        assert.equal(parsedGeometry.normals.length, 108)

        done()
      })
  })
})
