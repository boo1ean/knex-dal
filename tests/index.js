var mockDB = require('mock-knex');
var test = require('tape');
var knex = require('knex');

mockDB.knex.use(knex);
mockDB.knex.install();

var db = knex({
	client: 'postgres',
	connection: { database: 'app', user: 'root', password: 'root' },
});
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

require('./find')(users, softUsers, usersWithDefaults);
require('./query')(users, softUsers, usersWithDefaults);
require('./create')(users, softUsers, usersWithDefaults);
