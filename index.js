'use strict'

/*
 * vue-mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import Db from './src/Db'
import Server from './src/Server'
const db = new Db()

export default {
  db: db,
  boot: function (config, blueprints, fixtures) {
    const server = new Server(db, blueprints, fixtures)
    config(server)
  }
}
