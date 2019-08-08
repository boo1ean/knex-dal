var mockDB = require('mock-knex');
var test = require('tape');
var knex = require('knex');


var db = knex({
	client: 'postgres',
});

mockDB.mock(db);

var dal = require('../');

var users = dal({
	table: 'users',
	knex: db
});

var softUsers = dal({
	table: 'users',
	knex: db,
	softDeleteColumn: 'removed_at'
});

var usersWithDefaults = dal({
	table: 'users',
	knex: db,

	defaults: {
		create: { created_at: 'now' },
		update: { updated_at: 'now' }
	}
});

var usersWithPicks = dal({
	table: 'users',
	knex: db,

	pick: {
		create: ['email', 'password'],
		update: ['email', 'password']
	}
});

var usersWithPicksAndDefaults = dal({
	table: 'users',
	knex: db,

	defaults: {
		create: { created_at: 'now' },
		update: { updated_at: 'now' }
	},

	pick: {
		create: ['email', 'password'],
		update: ['email', 'password']
	}
});

require('./find')   (users, softUsers, usersWithDefaults, usersWithPicks, usersWithPicksAndDefaults);
require('./query' ) (users, softUsers, usersWithDefaults, usersWithPicks, usersWithPicksAndDefaults);
require('./create') (users, softUsers, usersWithDefaults, usersWithPicks, usersWithPicksAndDefaults);
require('./update') (users, softUsers, usersWithDefaults, usersWithPicks, usersWithPicksAndDefaults);
