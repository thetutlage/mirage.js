'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import _ from 'lodash'
import slash from 'slash'

export function getExportedValue (output) {
  if (typeof (output) === 'object' && output !== null) {
    return output.default || output
  }
  return output
}

export default function (webpackRequire) {
  return _.transform(webpackRequire.keys(), (result, key) => {
    const keyName = (slash(key)).replace(/^\.\/|\.js$/g, '')
    result[keyName] = getExportedValue(webpackRequire(key))
  }, {})
}
