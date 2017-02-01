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
import Collection from '../Collection'
import Chance from 'chance'

class Db {
  constructor () {
    this._blueprints = [] // models are defined via blueprints
    this._collections = {}
    this._collectionsIndex = {}
    this.faker = new Chance()
    this.faker.mixin({
      username: (length) => {
        length = length || 5
        return this.faker.word({length})
      },

      password: function (length) {
        length = length || 20
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        return _.map(_.range(length), () => {
          return charset.charAt(Math.floor(Math.random() * charset.length))
        }).join('')
      }
    })
  }

  /**
   * Returns a blueprint by name or returns null
   *
   * @method _findBluePrintByName
   *
   * @param  {String} name
   *
   * @return {Object}
   */
  _findBluePrintByName (name) {
    return _.find(this._blueprints, (blueprint) => blueprint.name === name) || null
  }

  /**
   * Returns a list of all the blueprints
   *
   * @method getBlueprints
   *
   * @return {Array}
   */
  getBlueprints () {
    return this._blueprints
  }

  /**
   * Returns a list of all the collections. Same
   * can be used for querying the objects.
   *
   * @method getCollections
   *
   * @return {Object}
   */
  getCollections () {
    return this._collections
  }

  /**
   * Registers a blueprint for a given name with
   * callback.
   *
   * @method blueprint
   *
   * @param  {String}   name
   * @param  {Function} callback
   */
  blueprint (name, callback) {
    if (typeof (callback) !== 'function') {
      throw new Error('blueprint expects a callback')
    }

    this._blueprints.push({
      name: name,
      callback: callback
    })
  }

  /**
   * Creates a new collection object or objects for a
   * given blueprint.
   *
   * @method create
   *
   * @param  {String} name
   * @param  {Object} [data]
   * @param  {Number} [instances=1]
   *
   * @throws {Error} If blueprint is not defined
   *
   * @return {Array|Object}
   */
  create (name, data, instances) {
    instances = instances || 1
    const blueprint = this._findBluePrintByName(name)
    if (!blueprint) {
      throw new Error(`Cannot create data object for ${name}. Make sure you have defined a blueprint for same`)
    }

    this._collections[name] = this._collections[name] || []
    this._collectionsIndex[name] = this._collectionsIndex[name] || 0

    const rows = _.map(_.range(instances), () => {
      const row = blueprint.callback(this.faker, this._collectionsIndex[name], data)
      this._collections[name].push(row)
      this._collectionsIndex[name]++
      return row
    })

    return instances === 1 ? rows[0] : rows
  }

  /**
   * Tries to find a record and if not found will create
   * it instead.
   *
   * @method findOrCreate
   *
   * @param  {String}     name
   * @param  {Object|Function}     searchClause
   * @param  {Object}     data
   * @param  {Number}     [instances=1]
   *
   * @return {Object|Array}
   */
  findOrCreate (name, searchClause, data, instances) {
    const record = this.get(name).find(searchClause)
    if (!record) {
      return this.create(name, data, instances)
    }
    return record
  }

  /**
   * Adds fixture(s) to the database.
   *
   * @method addFixture
   *
   * @param  {String}   name
   * @param  {Array|Object}   payload
   */
  addFixture (name, payload) {
    payload = payload instanceof Array === true ? payload : [payload]
    this._collections[name] = (this._collections[name] || []).concat(payload)
    this._collectionsIndex[name] = (this._collectionsIndex[name] || 0) + (payload.length)
  }

  /**
   * Returns all objects for a given blueprint
   *
   * @method get
   *
   * @param  {String} name
   *
   * @return {Array}
   */
  get (name) {
    return new Collection(this.getCollections()[name] || [])
  }

  /**
   * Clears everything from the database
   *
   * @method clear
   */
  clear () {
    this._collections = {}
    this._collectionsIndex = {}
  }
}

export default Db
