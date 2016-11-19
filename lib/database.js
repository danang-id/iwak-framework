'use strict';

/**
 * Database configuration
 *
 */

const path 		= require('path');

const knex 	  	= require('knex')(require(path.join(`${__dirname}/./../../../knexfile.js`))[env('NODE_ENV', 'development')]);
const bookshelf = require('bookshelf')(knex);

try {
	require(path.join(`${__dirname}/./../../../config/database`))(bookshelf);
}
catch(err) {
	throw new Error(`Database configuration error: ${err.message}`);
}

module.exports = bookshelf;