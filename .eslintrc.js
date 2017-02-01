'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    beforeEach: true,
    afterEach: true,
    describe: true,
    it: true
  },
  extends: 'standard',
  rules: {
    'arrow-parens': 0,
    // 'generator-star-spacing': 0
  }
}
