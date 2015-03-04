var test = require('tape');
var knex = require('knex')({
	client: 'postgresql', 
	connection: { database: 'app', user: 'root', password: 'root' },
});
var dal = require('../');

var users = dal({
	table: 'users',
	knex: knex
});

var softUsers = dal({
	table: 'users',
	knex: knex,
	softDeleteColumn: 'removed_at'
});

var usersWithDefaults = dal({
	table: 'users',
	knex: knex,

	defaults: {
		create: { created_at: 'now' },
		update: { updated_at: 'now' }
	}
});

require('./find')(users, softUsers, usersWithDefaults);
require('./query')(users, softUsers, usersWithDefaults);
require('./create')(users, softUsers, usersWithDefaults);
