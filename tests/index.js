var test = require('tape');
var knex = require('knex')({
	client: 'sqlite', 
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

require('./find')(users, softUsers);
require('./query')(users, softUsers);
