# Mirage

Mirage is HTTP mocking library for modern era development. It is quite similar to [Ember Mirage](http://www.ember-cli-mirage.com/) but less opinionated, since is does not targets any library or framework.

---

> Mirage plays well with any framework of your choice. Whether it is **VueJs**, **React** or **Riot**.

## Features

Under the hood it supports.

1. Routing.
2. Database factories and fakes.
3. Database fixtures.


## But Why?

Testing HTTP/Ajax requests are hard, since they will hit the real server and slow down your tests. Not only the speed is the issue, when running your tests inside CI (travis, etc), you need to make sure that your API server is reachable, otherwise your tests will fail.

To overcome these issues, everyone tries following ways:

1. Mock HTTP requests using Sinon or similar.
2. Make use of a local HTTP server bundled within the frontend app.

Both of the above are hard to setup and maintain in long run. Testing needs to be simple

## How it works?

Mirage starts simply by intercepting all Ajax requests made by your Ajax library and returns a mocked response. Which means, you won't have to touch a single line of code inside your tests or actual code when testing AJAX requests.

### Directory Structure

```
|-- mirage
|---- config.js
|---- blueprints/
|---- fixtures/
```


### Hardcoded response

You are free to skip the blueprints or fixtures and keep your mirage logic simple by returning hardcoded response from your routes.

```js
export default (app) {
  app.get('/users', () => {
    const status = 200
    const headers = {}
    const body = body: [{
      username: 'virk',
      age: 27
    }]

    return [status, headers, body]
  })
}
```

### Using Factories and Fakes

Database factories makes it simple to have logic around your mocked server. Returning a list of hardcoded users may be fine for a single scanerio. But think of situations, where you want to perform CRUD operations by showing a list of all the users and then deleting one and making sure new list does not return the deleted user.

**blueprints/users.js**
```js
export default (faker, i) {
  return {
    id: i + 1,
    username: faker.username(),
    password: faker.password()
  }
}
```

```js
// fetching a single user
app.get('/users/:id', (request, db) => {
  const userId = request.input('id')
  const user = db.get('users').findBy('id', userId)
  return [200, {}, user]
})

// removing user
app.delete('/users/:id', (request, db) => {
  const userId = request.input('id')
  db.get('users').lazyFilter((user) => user.id === userId).remove()
  return [200, {}, {deleted: true}]
})

// updating user
app.put('/users/:id', (request, db) => {
  const userId = request.input('id')
  
  db
    .get('users')
    .lazyFilter((user) => user.id === userId)
    .update({admin: true})
  
  return [200, {}, {updated: true}]
})
```


### Clearing DB State

Database has a persistent memory store. Which means changes made to the db while running your tests are persistent. It is a good practice to work with a clean state for each test.

```js
import { db } from 'mirage'

beforeEach(() => {
  db.clear()
})
```

### Fixtures

Fixtures are used to seed your database to have your world setup. For example, you want to test your application with some default state. It is quite common to have fixtures for **Settings API** or **Locale Strings** etc.

All fixtures are defined inside `mirage/fixutres` library and they can accessed by the DB instance.

```js
import { db } from 'mirage'
db.loadFixtures(['locales', 'settings'])
```

