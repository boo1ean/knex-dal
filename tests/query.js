var test = require('tape');

module.exports = function testQuery (users, softUsers) {
	test('simple query', function (t) {
		var q = users.query();
		t.equal(q._boundTo.builder.toString(), 'select * from "users"');
		t.end();
	});

	test('query by id soft deletes', function (t) {
		var q = softUsers.query();
		t.equal(q._boundTo.builder.toString(), 'select * from "users" where "removed_at" is null');
		t.end();
	});

	test('query by criteria', function (t) {
		var q = users.query({ email: 'test' });
		t.equal(q._boundTo.builder.toString(), 'select * from "users" where "email" = \'test\'');
		t.end();
	});
};
