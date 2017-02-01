'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

var testsContext = require.context('./test', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
