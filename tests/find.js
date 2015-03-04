var test = require('tape');

module.exports = function testFind (users, softUsers) {
	test('find by id', function (t) {
		var q = users.find(1);
		t.equal(q.toString(), 'select * from "users" where "id" = 1 limit 1');
		t.end();
	});

	test('find by id soft deletes', function (t) {
		var q = softUsers.find(1);
		t.equal(q.toString(), 'select * from "users" where "id" = 1 and "removed_at" is null limit 1');
		t.end();
	});

	test('find by criteria', function (t) {
		var q = users.find({ email: 'test' });
		t.equal(q.toString(), 'select * from "users" where "email" = \'test\' limit 1');
		t.end();
	});
};
