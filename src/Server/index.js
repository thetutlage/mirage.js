'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import Pretender from 'pretender'
import _ from 'lodash'

class Server {
  constructor (db, blueprints, fixtures) {
    this.pretender = new Pretender()
    this.db = db
    this.namespace = null
    this._fixtures = fixtures
    this._defaultPassThrough = ['http://localhost:0/chromecheckurl']

    /**
     * Hooks
     */
    this.pretender.prepareBody = this._prepareBody
    this.pretender.unhandledRequest = function (verb, path, request) {
      console.error(`A request was made to ${verb}:${path} but no handler defined for same`)
    }
    this._registerBluePrints(blueprints)
  }

  /**
   * Registers blueprints with the db instance.
   *
   * @method _registerBluePrints
   *
   * @param  {Object}
   */
  _registerBluePrints (blueprints) {
    _.each(blueprints, (callback, name) => {
      this.db.blueprint(name, callback)
    })
  }

  /**
   * Instructs server to use the default pass through
   *
   * @method useDefaultPassThroughs
   */
  useDefaultPassThroughs () {
    this.passthrough(this._defaultPassThrough)
  }

  /**
   * Sets the namespace for the urls
   *
   * @method setNamespace
   *
   * @param  {String}
   */
  setNamespace (namespace) {
    this.namespace = namespace.replace(/\/$/, '')
  }

  /**
   * Prepares the body of the response by properly
   * converting types.
   *
   * @method _prepareBody
   *
   * @param  {Mixed}     body
   *
   * @return {String}
   */
  _prepareBody (body) {
    const bodyType = typeof (body)

    switch (bodyType) {
      case 'object':
        return JSON.stringify(body)
      case 'number':
        return body.toString()
      default:
        return body
    }
  }

  /**
   * Glorifies the handler by passing db instance
   * to it.
   *
   * @method _glorifyHandler
   *
   * @param  {Function}      callback
   *
   * @return {Function}
   */
  _glorifyHandler (callback) {
    return (request) => {
      return callback(request, this.db)
    }
  }

  /**
   * Registers a url with GET verb.
   *
   * @method get
   *
   * @param  {String} url
   * @param  {Function} handler
   *
   * @return {Function}
   */
  get (url, handler) {
    url = this.namespace ? `${this.namespace}${url}` : url
    return this.pretender.get(url, this._glorifyHandler(handler))
  }

  /**
   * Registers a url with GET verb.
   *
   * @method get
   *
   * @param  {String} url
   * @param  {Function} handler
   * @param  {Function} timing
   *
   * @return {Function}
   */
  post (url, handler, timing) {
    url = this.namespace ? `${this.namespace}${url}` : url
    return this.pretender.post(url, this._glorifyHandler(handler), timing)
  }

  /**
   * Registers a url with PUT verb.
   *
   * @method put
   *
   * @param  {String} url
   * @param  {Function} handler
   * @param  {Function} timing
   *
   * @return {Function}
   */
  put (url, handler, timing) {
    url = this.namespace ? `${this.namespace}${url}` : url
    return this.pretender.put(url, this._glorifyHandler(handler), timing)
  }

  /**
   * Registers a url with PATCH verb.
   *
   * @method patch
   *
   * @param  {String} url
   * @param  {Function} handler
   * @param  {Function} timing
   *
   * @return {Function}
   */
  patch (url, handler, timing) {
    url = this.namespace ? `${this.namespace}${url}` : url
    return this.pretender.patch(url, this._glorifyHandler(handler), timing)
  }

  /**
   * Registers a url with DELETE verb.
   *
   * @method delete
   *
   * @param  {String} url
   * @param  {Function} handler
   * @param  {Function} timing
   *
   * @return {Function}
   */
  delete (url, handler, timing) {
    url = this.namespace ? `${this.namespace}${url}` : url
    return this.pretender.delete(url, this._glorifyHandler(handler), timing)
  }

  /**
   * Registers a url with HEAD verb.
   *
   * @method head
   *
   * @param  {String} url
   * @param  {Function} handler
   * @param  {Function} timing
   *
   * @return {Function}
   */
  head (url, handler, timing) {
    url = this.namespace ? `${this.namespace}${url}` : url
    return this.pretender.head(url, this._glorifyHandler(handler), timing)
  }

  /**
   * Shuts down the server
   *
   * @method shutdown
   */
  shutdown () {
    this.pretender.shutdown()
  }

  /**
   * Pass through a handfull of urls to make
   * HTTP requests to the actual server.
   *
   * @method passthrough
   *
   * @param  {Array|String}    urls
   */
  passthrough (urls) {
    urls = urls instanceof Array === true ? urls : [urls]
    _.each(urls, (url) => {
      const verb = url.verb ? url.verb.toLowerCase() : 'get'
      const requestUrl = url.url ? url.url : url
      this.pretender[verb](requestUrl, this.pretender.passthrough)
    })
  }

  /**
   * Loads fixtures on demand. This method will
   * register the same data twice when called
   * for multiple times.
   *
   * @method loadFixtures
   *
   * @param  {Array}     keys
   */
  loadFixtures (keys) {
    keys = keys instanceof Array === true ? keys : [keys]
    _.each(keys, (key) => {
      if (this._fixtures[key]) {
        this.db.addFixture(key, this._fixtures[key])
      }
    })
  }
}

export default Server
