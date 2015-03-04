var _ = require('lodash');

function build (opts) {
	assertOptions(opts);

	var knex = opts.knex;
	var table = opts.table;
	var viewTable = opts.viewTable || table;

	var fields       = _.isArray(opts.fields)       ? _.clone(opts.fields)       : null;
	var queryFields  = _.isArray(opts.queryFields)  ? _.clone(opts.queryFields)  : null;
	var createFields = _.isArray(opts.createFields) ? _.clone(opts.createFields) : null;
	var updateFields = _.isArray(opts.updateFields) ? _.clone(opts.updateFields) : null;
	var removeFields = _.isArray(opts.removeFields) ? _.clone(opts.removeFields) : null;

	var methods = _.isObject(opts.methods) ? opts.methods : {};
	var softDeleteColumn = opts.softDeleteColumn || null;

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
			.insert(attrs(data, createFields))
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
				.update(attrs(data, updateFields))
				.returning('id')
				.then(_.first);
		}
	}

	function getRemoveMethod () {
		if (softDeleteColumn) {
			return function remove (criteria) {

				var data = {};
				data[softDeleteColumn] = 'now';

				return knex(table)
					.where(prepareCriteria(criteria, removeFields))
					.update(data)
					.returning('id')
					.then(_.first);
			}
		} else {
			return function remove (criteria) {
				return knex(table)
					.where(prepareCriteria(criteria, removeFields))
					.del()
					.returning('id')
					.then(_.first);
			}
		}
	}

	function getFindMethod () {
		return function find (criteria) {
			var query = knex
				.first('*')
				.from(viewTable)
				.where(prepareCriteria(criteria, queryFields));

			if (softDeleteColumn) {
				query.whereNull(softDeleteColumn);
			}

			return query;
		}
	}

	function getQueryMethod () {
		return function query (criteria, opts) {
			criteria = criteria || {};

			var query = knex
				.select('*')
				.from(viewTable)
				.where(prepareCriteria(criteria, queryFields));

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

	function prepareCriteria (criteria, specificFields) {
		if (!criteria) {
			throw new Error('Criteria is required');
		}

		// If scalar passed, assume it's record id
		if (!_.isObject(criteria)) {
			return { id: criteria };
		}

		if (specificFields || fields) {
			return _.pick(criteria, specificFields || fields);
		}

		return criteria;
	}
}

module.exports = build;
