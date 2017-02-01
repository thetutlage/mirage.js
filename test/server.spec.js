'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import Server from '../src/Server'
import Db from '../src/Db'
import { assert } from 'chai'
import axios from 'axios'

describe('Server', () => {
  beforeEach(function () {
    this.server = new Server(new Db())
  })

  afterEach(function () {
    this.server.shutdown()
  })

  it('should be able to define a route on the server', function (done) {
    let handlerCalled = false
    this.server.get('/users', function () {
      handlerCalled = true
      return [200]
    })

    axios
    .get('/users')
    .then(() => {
      assert.equal(handlerCalled, true)
      done()
    })
    .catch(done)
  })

  it('should pass the request and the db instance to the handler', function (done) {
    let args = {}
    this.server.get('/users', function (request, db) {
      args = { request, db }
      return [200]
    })

    axios
    .get('/users')
    .then(() => {
      assert.instanceOf(args.db, Db)
      assert.equal(args.request.url, '/users')
      done()
    })
    .catch(done)
  })

  it('should be able to return a javascript object from the handler', function (done) {
    this.server.get('/users', function () {
      return [200, {}, {username: 'virk'}]
    })

    axios
    .get('/users')
    .then((response) => {
      assert.deepEqual(response.data, {username: 'virk'})
      done()
    })
    .catch(done)
  })

  it('should be able to return null from the handler', function (done) {
    this.server.get('/users', function () {
      return [200, {}, null]
    })

    axios
    .get('/users')
    .then((response) => {
      assert.equal(response.data, null)
      done()
    })
    .catch(done)
  })

  it('should be able to return a number from the handler', function (done) {
    this.server.get('/users', function () {
      return [200, {}, 2]
    })

    axios
    .get('/users')
    .then((response) => {
      assert.equal(response.data, 2)
      done()
    })
    .catch(done)
  })

  it('should be able to return an array from the handler', function (done) {
    this.server.get('/users', function () {
      return [200, {}, [1, 2, 3]]
    })

    axios
    .get('/users')
    .then((response) => {
      assert.deepEqual(response.data, [1, 2, 3])
      done()
    })
    .catch(done)
  })

  it('should be able to define passthrough url', function (done) {
    this.server.passthrough('/users')

    axios
    .get('/users')
    .then()
    .catch(({ response }) => {
      assert.equal(response.status, 404)
      done()
    })
  })

  it('should be able to define multiple passthrough url', function (done) {
    this.server.passthrough(['/users', '/settings'])

    axios
    .get('/users')
    .then()
    .catch(({ response }) => {
      assert.equal(response.status, 404)
      return axios.get('/settings')
    })
    .catch(({ response }) => {
      assert.equal(response.status, 404)
      done()
    })
  })

  it('should be able to define verbs for the passthrough urls', function (done) {
    this.server.passthrough([{
      url: '/users',
      verb: 'GET'
    }])

    this.server.post('/users', () => [201, {}, {success: true}])

    axios
    .post('/users')
    .then((response) => {
      assert.deepEqual(response.data, {success: true})
      return axios.get('/users')
    })
    .catch(({ response }) => {
      assert.equal(response.status, 404)
      done()
    })
  })

  it('should be able to define the urls namespace', function (done) {
    this.server.setNamespace('api/')
    this.server.get('/users', function () {
      return [200, {}, [1, 2, 3]]
    })

    axios
    .get('api/users')
    .then((response) => {
      assert.deepEqual(response.data, [1, 2, 3])
      done()
    })
    .catch(done)
  })

  it('should load fixtures on demand', function () {
    this.server.shutdown()
    const countries = [{
      id: 1,
      name: 'India'
    }, {
      id: 2,
      name: 'USA'
    }]

    const server = new Server(new Db(), {}, { countries })
    assert.deepEqual(server.db.get('countries').all(), [])
    server.loadFixtures('countries')
    assert.deepEqual(server.db.get('countries').all(), countries)
    server.shutdown()
  })

  it('should load multiple fixtures on demand', function () {
    this.server.shutdown()
    const countries = [{
      id: 1,
      name: 'India'
    }, {
      id: 2,
      name: 'USA'
    }]

    const users = [{
      username: 'virk'
    }]

    const server = new Server(new Db(), {}, { countries, users })

    assert.deepEqual(server.db.get('countries').all(), [])
    assert.deepEqual(server.db.get('users').all(), [])

    server.loadFixtures(['countries', 'users'])

    assert.deepEqual(server.db.get('countries').all(), countries)
    assert.deepEqual(server.db.get('users').all(), users)
    server.shutdown()
  })

  it('should register blueprints to the db', function () {
    this.server.shutdown()
    const server = new Server(new Db(), {
      users: function () {
        return {
          username: 'virk'
        }
      }
    })
    server.db.create('users')
    assert.isDefined(server.db.getBlueprints()[0].name, 'users')
    assert.deepEqual(server.db.get('users').all(), [{username: 'virk'}])
    server.shutdown()
  })
})
