var _ = require('lodash');

function build (opts) {
	assertOptions(opts);

	var knex = opts.knex;
	var table = opts.table;
	var fields = _.isArray(opts.fields) ? opts.fields : null;

	return {
		create: function create (data) {
			return knex(table)
				.insert(attrs(data))
				.returning('id')
				.then(_.first);
		},

		update: function update (data) {
			if (!data || !data.id) {
				throw new Error('Update operation requires id');
			}

			return knex(table)
				.where('id', data.id)
				.update(attrs(data))
				.returning('id')
				.then(_.first);
		},

		remove: function remove (criteria) {
			return knex(table)
				.where(prepareCriteria(criteria))
				.update({ removed_at: 'now' })
				.returning('id')
				.then(_.first);
		},

		find: function find (criteria) {
			return knex
				.first('*')
				.from(table)
				.where(prepareCriteria(criteria));
		},

		query: function query (criteria, opts) {
			criteria = criteria || {};

			var query = knex
				.select('*')
				.from(table)
				.where(criteria);

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
	};

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

	// If field constraints are specified then filter input data
	function attrs (data) {
		if (!fields) {
			return data;
		}

		return _.pick(data, fields);
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
