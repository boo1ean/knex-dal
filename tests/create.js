var test = require('tape');

module.exports = function testFind (users, softUsers, usersWithDefaults, usersWithPicks, usersWithPicksAndDefaults) {
	test('simple create', function (t) {
		var q = users.create({ email: 1, password: 3 });
		t.equal(q._boundTo.builder.toString(), 'insert into "users" ("email", "password") values (1, 3)');
		t.end();
	});

	test('create defaults', function (t) {
		var q = usersWithDefaults.create({ email: 1, password: 3 });
		t.equal(q._boundTo.builder.toString(), 'insert into "users" ("created_at", "email", "password") values (\'now\', 1, 3)');
		t.end();
	});

	test('create picks', function (t) {
		var q = usersWithPicks.create({ email: 1, password: 3, beep: 'boop', ping: 'pong' });
		t.equal(q._boundTo.builder.toString(), 'insert into "users" ("email", "password") values (1, 3)');
		t.end();
	});

	test('create pick and defaults', function (t) {
		var q = usersWithPicksAndDefaults.create({ email: 1, password: 3, beep: 'boop', ping: 'pong' });
		t.equal(q._boundTo.builder.toString(), 'insert into "users" ("created_at", "email", "password") values (\'now\', 1, 3)');
		t.end();
	})
};
