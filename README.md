## knex database access layer builder

Simple extendable database access layer builder aimed to work with raw objects and arrays instead of shitty OOP-ish models and collections junk.

## Installation

```
npm install knex-dal
```

## Usage

Minimal setup

```javascript
var dal = require('knex-dal');
var knex = require('../your-configured-knex');

var users = dal({
	knex: knex,
	table: 'users'
});

users.query().then(console.log);
// [{ id: 1, email: 'email@example.com', ... }, ... ]
```

## Options

```javascript
{
	 // table name
	table: 'users',

	// Knex instance
	knex: knex,

	// (optional) table to perform read queries (e.g. use view for read operations)
	viewTable: 'v_users',

	// (optional) Method-specific fields to pick from input object
	pick: {
		query:  ['email', 'name'],
		create: ['email', 'name', 'address'],
		update: ['name', 'address'],
		remove: ['id'],
	},

	// (optional) Method-specific default attributes to extend input object
	defaults: {
		create: { created_at: 'now' },
		update: { updated_at: 'now' },
	},

	// (optional) Soft deletes column
	// removed_at = null,     - record exists
	// removed_at = not null, - record removed
	// If softDeleteColumn is set then remove method will make soft deletes instead of hard ones
	// And query / find methods will check for "removed_at is not null"
	softDeleteColumn: 'removed_at',

	// (optional) Object with additional methods
	methods: { findLast: function findLast () { ... } }
}
```

## Embeded methods

### create (Object data)

Insert data in table and returns id of inserted row

```javascript
users.create({ name: 'John', email: 'jhon@example.com' }).then(console.log);
// 426
```

### update (Object data)

Data object should contain id property which is used for where closure.   
Update method returns updated row id.

Example of updating `email` for user with `id = 105`:

```javascript
users.update({ id: 105, email: 'new@example.com' }).then(console.log);
// 105
```

### find (Object|Int criteria)

Find single row by given criteria.

```javascript
users.find({ email: 'my@example.com' }).then(console.log);
// { id: 343, email: 'my@example.com', ... }
```

If scalar value is passed to `find` dal assumes that it's row's id and build corresponding where closure:

```javascript
users.find(343).then(console.log);
// { id: 343, email: 'my@example.com', ... }
```

### query (Object criteria, Object options)

Finds list of objects by given criteria.

```javascript
// Find all users
users.query();

// Find users of specific type
users.query({ type: 'manager' });
```

Also you can pass `offset` and `limit` params via `options` object:

```javascript
// 50 users starting from 50 (typically for pagination)
users.query(null, { offset: 50, limit: 50 });
```

### remove (Object|Int criteria)

Removes row by criteria.

```javascript
// Remove by criteria
users.remove({ name: 'John' }).then(console.log);
// 434
```

If scalar value is passed to `remove` dal assumes that it's row's id and uses corresponding where closure:

```javascript
// Remove by id
users.remove(304).then(console.log);
// 304
```

## Extend dal with custom methods

Here is common approach how add new methods to dal:

```javascript
var lodash = require('lodash');
var knex = require('../your-configured-knex');
var table = 'users';

module.exports = dal({
	table: table,
	knex: knex,
	methods: {
		removeIfProcessed: findOrCreate (params) {
			return knex(table)
				.where(params)
				.where({ status: 'processed' })
				.del()
				.returning('id')
				.then(_.first);
		},
		
		...
	}
})

// Somewhere in app

var users = require('./dals/users');
users.removeIfProcessed({ id: 100 }).then(...);
```

## LICENSE
MIT
