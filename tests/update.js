var test = require('tape');

module.exports = function testFind (users, softUsers, usersWithDefaults, usersWithPicks, usersWithPicksAndDefaults) {
	test('simple update', function (t) {
		var q = users.update({ id: 1, email: 1, password: 3 });
		t.equal(q.toString(), 'update "users" set "id" = 1, "email" = 1, "password" = 3 where "id" = 1');
		t.end();
	});

	test('update defaults', function (t) {
		var q = usersWithDefaults.update({ id: 2, email: 1, password: 3 });
		t.equal(q.toString(), 'update "users" set "id" = 2, "email" = 1, "password" = 3, "updated_at" = \'now\' where "id" = 2');
		t.end();
	});

	test('update picks', function (t) {
		var q = usersWithPicks.update({ id: 2, email: 1, password: 3, beep: 'boop', ping: 'pong' });
		t.equal(q.toString(), 'update "users" set "email" = 1, "password" = 3 where "id" = 2');
		t.end();
	});

	test('update pick and defaults', function (t) {
		var q = usersWithPicksAndDefaults.update({ id: 1, email: 1, password: 3, beep: 'boop', ping: 'pong' });
		t.equal(q.toString(), 'update "users" set "email" = 1, "password" = 3, "updated_at" = \'now\' where "id" = 1');
		t.end();
	})
};
