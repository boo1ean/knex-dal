## app-dal

Part of app-helpers project.

Database access layer builder powered by [knex](http://knexjs.org/).

Since it uses knex it's fully promise based (powered by [bluebird](https://github.com/petkaantonov/bluebird))

## Installation

```
npm install app-dal
```

## Usage

Minimal setup

```javascript
var dal = require('app-dal');
var knex = require('../your-knex');

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

	// Method-specific fields to pick from params object
	pick: {
		query:  ['email', 'name'],
		create: ['email', 'name', 'address'],
		update: ['name', 'address'],
		remove: ['id'],
	},

	// Method-specific default attributes
	defaults: {
		create: { created_at: 'now' },
		update: { updated_at: 'now' },
	},

	// Soft deletes column should by type of date / timestamp
	// removed_at = null,     - object exists
	// removed_at = not null, - object removed
	// By specifying softDeleteColumn will force remove method to set it's value to "now"
	// And query / find methods to check for "removed_at is not null"
	softDeleteColumn: 'removed_at',

	// (optional) Object with additional methods
	methods: { findLast: function () { ... } }
}
```

## API

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
// Remove by id
users.remove(304).then(console.log);
// 304

// Remove by criteria
users.remove({ name: 'John' }).then(console.log);
// 434
```

#### Soft deletes

In case when `softDeleteColumn` option is used ... (see options description above)

## LICENSE
MIT
