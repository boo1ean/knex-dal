var test = require('tape');

module.exports = function testFind (users, softUsers) {
	test('simple create', function (t) {
		var q = users.create({ email: 1, password: 3 });
		console.log(q.toString());
		//t.equal(q.toString(), 'select * from "users" where "id" = 1 limit 1');
		t.end();
	});
};
