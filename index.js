var _ = require('lodash');

function build (opts) {
	assertOptions(opts);

	var knex = opts.knex;
	var table = opts.table;
	var viewTable = opts.viewTable || table;

	var pick     = _.isObject(opts.pick)     ? _.clone(opts.pick)     : {};
	var defaults = _.isObject(opts.defaults) ? _.clone(opts.defaults) : {};
	var methods  = _.isObject(opts.methods)  ? opts.methods           : {};
	var mixins   = _.isArray(opts.mixins)    ? opts.mixins            : [];

	var softDeleteColumn = opts.softDeleteColumn || null;

	var dal = {};

	mixins.forEach(function applyMixin (methods) {
		_.extend(dal, assertAndBindMethods(methods, dal));
	});

	return _.extend(dal, {
		create: buildCreateMethod(),
		update: buildUpdateMethod(),
		remove: buildRemoveMethod(),
		find: buildFindMethod(),
		query: buildQueryMethod()
	}, assertAndBindMethods(methods, dal));

	return dal;

	// Check if options are ok
	function assertOptions (opts) {
		if (!_.isObject(opts)) {
			throw new Error('Options should be an object');
		}

		if (!opts.table) {
			throw new Error('Table name is required');
		}

		if (!opts.knex) {
			throw new Error('knex instance is required');
		}
	}

	function buildCreateMethod () {
		return function create (data) {
			return knex(table)
				.insert(_.defaults(attrs(data, pick.create), defaults.create))
				.returning('id')
				.then(_.first);
		}
	}

	function buildUpdateMethod () {
		return function update (data) {
			if (!data || !data.id) {
				throw new Error('Update operation requires id');
			}

			return knex(table)
				.where('id', data.id)
				.update(_.defaults(attrs(data, pick.update), defaults.update))
				.returning('id')
				.then(_.first);
		}
	}

	function buildRemoveMethod () {
		if (softDeleteColumn) {
			return function remove (criteria) {

				var data = {};
				data[softDeleteColumn] = 'now';

				var criteria = prepareCriteria(criteria, pick.remove)

				if (_.isEmpty(criteria)) {
					throw new Error('Empty criteria, please check fields config');
				}

				return knex(table)
					.where(criteria)
					.update(data)
					.returning('id')
					.then(_.first);
			}
		} else {
			return function remove (criteria) {
				var criteria = prepareCriteria(criteria, pick.remove)

				if (_.isEmpty(criteria)) {
					throw new Error('Empty criteria, please check fields config');
				}

				return knex(table)
					.where(criteria)
					.del()
					.returning('id')
					.then(_.first);
			}
		}
	}

	function buildFindMethod () {
		return function find (criteria) {
			var query = knex
				.first('*')
				.from(viewTable)
				.where(prepareCriteria(criteria, pick.query));

			if (softDeleteColumn) {
				query.whereNull(softDeleteColumn);
			}

			// Use this to trigger query execution
			return query.then(after);
		}
	}

	function buildQueryMethod () {
		return function query (criteria, opts) {
			criteria = criteria || {};

			var query = knex
				.select('*')
				.from(viewTable)
				.where(prepareCriteria(criteria, pick.query));

			if (softDeleteColumn) {
				query.whereNull(softDeleteColumn);
			}

			// Check out additional options
			if (opts) {
				if (opts.limit && opts.limit > 0) {
					query.limit(opts.limit);
				}

				if (opts.offset && opts.offset > 0) {
					query.offset(opts.offset);
				}
			}

			// Use this to trigger query execution
			return query.then(after);
		}
	}

	// If field constraints are specified then filter input data
	function attrs (data, specificFields) {
		return stringifyObjects(specificFields ? _.pick(data, specificFields) : data);
	}

	// Stringify properties (e.g. for postgres json types)
	function stringifyObjects (obj) {
		for (var i in obj) {
			if (_.isObject(obj[i]) && !(obj[i] instanceof Buffer)) {
				obj[i] = JSON.stringify(obj[i]);
			}
		}

		return obj;
	}

	function prepareCriteria (criteria, specificFields) {
		if (!criteria) {
			throw new Error('Criteria is required');
		}

		// If scalar passed, assume it's record id
		if (!_.isObject(criteria)) {
			criteria = { id: criteria };
		}

		if (specificFields) {
			criteria = _.pick(criteria, specificFields);
		}

		return criteria;
	}

	function after (data) {
		return data;
	}

	function assertAndBindMethods (methods, thisArg) {
		for (var i in methods) {
			if (typeof methods[i] !== 'function') {
				throw new Error('DAL method should be function: ' + i);
			}

			methods[i] = methods[i].bind(thisArg);
		}
		return methods;
	}
}

module.exports = build;
