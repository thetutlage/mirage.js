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

class Collection {
  constructor (payload) {
    this._payload = payload
    this._lazyWhereClause = null
  }

  /**
   * Returns everything from the collection
   *
   * @method all
   *
   * @return {Array}
   */
  all () {
    return this._payload
  }

  /**
   * Returns a paginated list of items
   *
   * @method paginate
   *
   * @param  {Number} offset [description]
   * @param  {Number} [limit=20]
   *
   * @return {Array}
   */
  paginate (offset, limit) {
    limit = limit || 20
    return _.take(_.drop(this._payload, offset), limit)
  }

  /**
   * Finds a given record by key and it's value.
   *
   * @method findBy
   *
   * @param  {String} key   [description]
   * @param  {Mixed} value [description]
   *
   * @return {Object}       [description]
   */
  findBy (key, value) {
    if (!value) {
      return _.find(this._payload, key)
    }
    return _.find(this._payload, (item) => item[key] === value) || null
  }

  /**
   * Finds a record by adding a where clause via
   * callback or an object.
   *
   * @method find
   *
   * @param  {Object|Function} whereClause
   *
   * @return {Object}
   */
  find (whereClause) {
    return _.find(this._payload, whereClause) || null
  }

  /**
   * Filters the record by passing a callback or
   * an object.
   *
   * @method filter
   *
   * @param  {Function|Object} whereClause
   *
   * @return {Array}
   */
  filter (whereClause) {
    return _.filter(this._payload, whereClause)
  }

  /**
   * Lazy filter that get's applied on the next operation
   *
   * @method lazyFilter
   *
   * @param  {Object|Function}   whereClause
   *
   * @chainable
   */
  lazyFilter (whereClause) {
    this._lazyWhereClause = whereClause
    return this
  }

  /**
   * Updates items by merging the update values. Using
   * lazyFilter will cherry pick the items for the
   * update operation
   *
   * @method update
   *
   * @param  {Object} updateValues
   */
  update (updateValues) {
    _.each(this._payload, (item) => {
      if (!this._lazyWhereClause) {
        _.merge(item, updateValues)
      } else if (this._lazyWhereClause(item)) {
        _.merge(item, updateValues)
      }
    })
    this._lazyWhereClause = null
  }

  /**
   * Removes the items from the collection. Lazy filter
   * method can be used to cherry pick items for the
   * remove operation
   *
   * @method remove
   *
   * @return {Array} removed items
   */
  remove () {
    if (this._lazyWhereClause) {
      const result = _.remove(this._payload, this._lazyWhereClause)
      this._lazyWhereClause = null
      return result
    }
    return _.remove(this._payload)
  }
}

export default Collection
