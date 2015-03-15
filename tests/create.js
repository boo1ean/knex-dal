var test = require('tape');

module.exports = function testFind (users, softUsers) {
	test('simple create', function (t) {
		var q = users.create({ email: 1, password: 3 });
		t.equal(q._boundTo.builder.toString(), 'insert into "users" ("email", "password") values (1, 3)');
		t.end();
	});
};
