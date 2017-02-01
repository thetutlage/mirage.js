'use strict'

/*
 * mirage
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { assert } from 'chai'
import Db from '../src/Db'

describe('Db', () => {
  it('should be able to define a blueprint', () => {
    const db = new Db()
    const userCallback = function () {}
    db.blueprint('user', userCallback)
    assert.deepEqual(db.getBlueprints(), [{name: 'user', callback: userCallback}])
  })

  it('should throw exception when blueprint callback is not a function', () => {
    const db = new Db()
    const fn = () => db.blueprint('user', {})
    assert.throw(fn, 'blueprint expects a callback')
  })

  it('should return the blueprint using it\'s name', () => {
    const db = new Db()
    const userCallback = function () {}
    db.blueprint('user', userCallback)
    assert.deepEqual(db._findBluePrintByName('user'), {name: 'user', callback: userCallback})
  })

  it('should be able to create a collection using the db.create method', () => {
    const db = new Db()
    const userCallback = function () {
      return {
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    const user = db.create('user')
    assert.deepEqual(db.getCollections().user, [{username: 'virk'}])
    assert.deepEqual(user, {username: 'virk'})
  })

  it('should be able to create multiple collections using the db.create method', () => {
    const db = new Db()
    const userCallback = function () {
      return {
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    const users = db.create('user', {}, 3)
    assert.deepEqual(db.getCollections().user, [{username: 'virk'}, {username: 'virk'}, {username: 'virk'}])
    assert.deepEqual(users, [{username: 'virk'}, {username: 'virk'}, {username: 'virk'}])
  })

  it('should pass id to the blueprint callback', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user')
    assert.deepEqual(db.getCollections().user, [{id: 1, username: 'virk'}])
  })

  it('should pass custom data to the blueprint callback', () => {
    const db = new Db()
    const userCallback = function (faker, i, props) {
      return {
        id: i + 1,
        username: 'virk',
        age: props.age
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {age: 22})
    assert.deepEqual(db.getCollections().user, [{id: 1, username: 'virk', age: 22}])
  })

  it('should pass faker object to the blueprint method', () => {
    const db = new Db()
    const userCallback = function (faker) {
      return {
        bio: faker.sentence()
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {age: 22})
    assert.isString(db.getCollections().user[0].bio)
  })

  it('should throw exception when creating a collection without blueprint', () => {
    const db = new Db()
    const fn = () => db.create('user', {age: 22})
    assert.throw(fn, 'Cannot create data object for user. Make sure you have defined a blueprint for same')
  })

  it('should return all values by calling fetch method on lodash chain', () => {
    const db = new Db()
    const userCallback = function () {
      return {
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 3)
    assert.deepEqual(db.get('user').all(), [{username: 'virk'}, {username: 'virk'}, {username: 'virk'}])
  })

  it('should be able to pass a callback to the find method', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 3)
    const firstUser = db.get('user').find((user) => user.id === 1)
    assert.deepEqual(firstUser, {username: 'virk', id: 1})
  })

  it('should be able to filter multiple users', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: i === 2 ? 'nikk' : 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 3)
    const filteredUsers = db.get('user').filter((user) => user.username === 'virk')
    assert.deepEqual(filteredUsers, [{username: 'virk', id: 1}, {username: 'virk', id: 2}])
  })

  it('should not mutate the actual data collection when filtering', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 3)
    assert.deepEqual(db.get('user').findBy('id', 1), {username: 'virk', id: 1})
    assert.deepEqual(db._collections.user, [{username: 'virk', id: 1}, {username: 'virk', id: 2}, {username: 'virk', id: 3}])
  })

  it('should be able to update all collection records', () => {
    const db = new Db()
    const userCallback = function () {
      return {
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 2)

    db.get('user').update({age: 22, username: 'nikk'})
    assert.deepEqual(db.get('user').all(), [{username: 'nikk', age: 22}, {username: 'nikk', age: 22}])
  })

  it('should be able to update a single collection record', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 2)

    db.get('user').lazyFilter((user) => user.id === 1).update({age: 22, username: 'nikk'})
    assert.deepEqual(db.get('user').all(), [{id: 1, username: 'nikk', age: 22}, {id: 2, username: 'virk'}])
  })

  it('should be able to remove all collection records', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 2)

    db.get('user').remove()
    assert.deepEqual(db.get('user').all(), [])
  })

  it('should be able to remove a single collection records', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 2)

    db.get('user').lazyFilter((user) => user.id === 1).remove()
    assert.deepEqual(db.get('user').all(), [{id: 2, username: 'virk'}])
  })

  it('should update the actual db upon remove operation', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 2)

    db.get('user').lazyFilter((user) => user.id === 1).remove()
    assert.deepEqual(db.get('user').all(), [{id: 2, username: 'virk'}])
    assert.deepEqual(db._collections.user, [{id: 2, username: 'virk'}])
  })

  it('should be able to paginate records', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return i + 1
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 10)
    assert.deepEqual(db.get('user').paginate(0, 3), [1, 2, 3])
    assert.deepEqual(db.get('user').paginate(3, 3), [4, 5, 6])
  })

  it('should be able to paginate records after the remove operation', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return i + 1
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 10)
    db.get('user').lazyFilter((user) => user < 2).remove()
    assert.deepEqual(db.get('user').paginate(0, 3), [2, 3, 4])
    assert.deepEqual(db.get('user').paginate(3, 3), [5, 6, 7])
  })

  it('should be able to create a record when existing not found', () => {
    const db = new Db()
    const userCallback = function (faker, i, payload) {
      return {
        id: i + 1,
        username: payload && payload.username ? payload.username : 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 1)
    db.findOrCreate('user', {username: 'foo'}, {username: 'foo'})
    assert.deepEqual(db.get('user').all(), [{username: 'virk', id: 1}, {username: 'foo', id: 2}])
  })

  it('should return existing record when found', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        username: 'virk'
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 1)
    const user = db.findOrCreate('user', {username: 'virk'})
    assert.deepEqual(user, {username: 'virk', id: 1})
    assert.deepEqual(db.get('user').all(), [{username: 'virk', id: 1}])
  })

  it('should be able to define a property as a getter', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        get username () {
          return 'virk'
        }
      }
    }
    db.blueprint('user', userCallback)
    db.create('user', {}, 1)
    assert.deepEqual(db.get('user').all(), [{username: 'virk', id: 1}])
  })

  it('should be able to add a fixtures to the database', () => {
    const db = new Db()
    db.blueprint('user', function () {})
    db.addFixture('user', {username: 'virk', id: 1})
    assert.deepEqual(db.get('user').all(), [{username: 'virk', id: 1}])
  })

  it('should maintain the index when has been added', () => {
    const db = new Db()
    const userCallback = function (faker, i) {
      return {
        id: i + 1,
        get username () {
          return 'virk'
        }
      }
    }
    db.blueprint('user', userCallback)
    db.addFixture('user', {username: 'virk', id: 1})
    db.create('user')
    assert.deepEqual(db.get('user').all(), [{username: 'virk', id: 1}, {username: 'virk', id: 2}])
  })
})
