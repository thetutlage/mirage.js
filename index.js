'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import Db from './src/Db'
import Server from './src/Server'

export const db = new Db()
export const mirage = {
  perform (config, blueprints, fixtures) {
    const server = new Server(db, blueprints, fixtures)
    config(server)
  }
}

export { default as importAll } from './lib/importAll'
