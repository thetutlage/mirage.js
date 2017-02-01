'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { getExportedValue } from '../lib/importAll'
import { assert } from 'chai'

describe('importAll', () => {
  it('should return the default value when exported object has default key', () => {
    assert.equal(getExportedValue({default: 'a'}), 'a')
  })

  it('should return the exported object when it does not have a default key', () => {
    assert.equal(getExportedValue('func'), 'func')
  })

  it('should return the exported object when it is null', () => {
    assert.equal(getExportedValue(null), null)
  })
})
