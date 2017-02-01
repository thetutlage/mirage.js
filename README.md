# Vue Mirage

Vue mirage is HTTP mocking library for VueJs. It is quite similar to [Ember Mirage](http://www.ember-cli-mirage.com/) but less opinionated, since Vuejs is no concept of **convention over configuration**.

---

## Features

Under the hood it supports.

1. Routing
2. Database factories and fakes.
3. Database fixtures.


## But Why?

Testing HTTP/Ajax requests are hard, since they will hit the real server and slow down your tests. Not only the speed is the issue, when running your tests inside CI (travis, etc), you need to make sure that your API server is reachable, otherwise your tests will fail.

To overcome these issues, everyone tries following ways:

1. Mock HTTP requests using Sinon or similar.
2. Make use of a local HTTP server bundled within the frontend app.

Both of the above are hard to setup and maintain in long run. Testing needs to be simple

## How it works?

Vue mirage starts simply by intercepting all HTTP requests made by your HTTP library and returns a mocked response. Which means, you won't have to touch a line of code inside your tests or actual code when testing AJAX requests.

### Directory Structure

```
|-- mirage
|---- routes.js
|---- server.js
|---- blueprints/
|---- fixtures/
```


### Hardcoded response

You are free to skip the blueprints or fixtures and keep your mirage logic simple by returning hardcoded response from your routes.

```js
export default (app) {
  app.get('/users', () => {
    return {
      status: 200,
      body: [{
        username: 'virk',
        age: 27
      }]
    }

  })
}
```

### Using Factories and Fakes

Database factories makes it simple to have logic around your mocked server. Returning a list of hardcoded users may be fine for a single scanerio. But think of situations, where you want to perform CRUD operations by showing a list of all the users and then deleting one and making sure new list returns 3.

**blueprints/user.js**
```js
// fetching a single user
app.get('/user/:id', (request, db) => {
  const userId = request.input('id')
  const user = db.get('user').findBy('id', userId)

  return {
    status: 200,
    body: user
  }
})

// removing user
app.delete('/user/:id', (request, db) => {
  const userId = request.input('id')
  db.get('user').deleteBy('id', userId)

  return {
    status: 200,
    body: {
      deleted: true
    }
  }
})

// updating user
app.put('/user/:id', (request, db) => {
  const userId = request.input('id')
  const user = db.get('user').findBy('id', userId)
  user.update({admin: true})

  return {
    status: 200,
    body: {
      updated: true
    }
  }
})
```


### Clearing DB State

Database has a persistent memory store. Which means changes made to the db while running your tests are persistent. It is a good practice to work with a clean state for each test.

```js
import { db } from 'vue-mirage'

beforeEach(() => {
  db.clear()
})
```

### Fixtures

Fixtures are used to seed your database to have your world setup. For example, you want to test your application with some default state. It is quite common to have fixtures for **Settings API** or **Locale Strings** etc.

All fixtures are defined inside `mirage/fixutres` library and they can accessed by the DB instance.

```js
import { db } from 'vue-mirage'
db.loadFixtures() // loads all files from the fixtures directory
```

