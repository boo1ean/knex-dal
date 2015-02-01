var _ = require('lodash');

function build (opts) {
	assertOptions(opts);

	var knex = opts.knex;
	var table = opts.table;
	var viewTable = opts.viewTable || table;
	var fields = _.isArray(opts.fields) ? opts.fields : null;
	var methods = _.isObject(opts.methods) ? opts.methods : {};
	var softDeletes = opts.softDeletes;

	return _.extend({
		create: getCreateMethod(),
		update: getUpdateMethod(),
		remove: getRemoveMethod(),
		find: getFindMethod(),
		query: getQueryMethod()
	}, methods);

	// Check if options are ok
	function assertOptions (opts) {
		if (!_.isObject(opts)) {
			throw new Error('DAL options should be an object');
		}

		if (!opts.table) {
			throw new Error('Table name is required');
		}

		if (!opts.knex) {
			throw new Error('knex instance is required');
		}
	}

	function getCreateMethod () {
		return function create (data) {
			return knex(table)
			.insert(attrs(data))
			.returning('id')
			.then(_.first);
		}
	}

	function getUpdateMethod () {
		return function update (data) {
			if (!data || !data.id) {
				throw new Error('Update operation requires id');
			}

			return knex(table)
				.where('id', data.id)
				.update(attrs(data))
				.returning('id')
				.then(_.first);
		}
	}

	function getRemoveMethod () {
		if (softDeletes) {
			return function remove (criteria) {
				return knex(table)
					.where(prepareCriteria(criteria))
					.update({ removed_at: 'now' })
					.returning('id')
					.then(_.first);
			}
		} else {
			return function remove (criteria) {
				return knex(table)
					.where(prepareCriteria(criteria))
					.del()
					.returning('id')
					.then(_.first);
			}
		}
	}

	function getFindMethod () {
		return function find (criteria) {
			return knex
			.first('*')
			.from(viewTable)
			.where(prepareCriteria(criteria));
		}
	}

	function getQueryMethod () {
		return function query (criteria, opts) {
			criteria = criteria || {};

			var query = knex
			.select('*')
			.from(viewTable)
			.where(criteria);

			if (softDeletes) {
				query.whereNull('removed_at');
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

			return query;
		}
	}

	// If field constraints are specified then filter input data
	function attrs (data) {
		return stringifyObjects(fields ? _.pick(data, fields) : data);
	}

	// Stringify properties (e.g. for postgres json types)
	function stringifyObjects (obj) {
		for (var i in obj) {
			if (_.isObject(obj[i])) {
				obj[i] = JSON.stringify(obj[i]);
			}
		}

		return obj;
	}

	function prepareCriteria (criteria) {
		if (!criteria) {
			throw new Error('Criteria is required');
		}

		// If scalar passed, assume it's record id
		if (!_.isObject(criteria)) {
			return { id: criteria };
		}

		return criteria;
	}
}

module.exports = build;
