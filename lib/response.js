'use strict';

/**
 * Response formatter
 *
 */

const Logger = require('./logger');

const writeLog = function (req, code, callback) {
	try {
		if(env('APP_DEBUG', 'true') == 'true') {
			let ip = req.connection.remoteAddress || 'unknown';
			let method = req.method || 'unknown';
			let url = req.originalUrl || 'unknown';

			Logger.info(`Request ${method} ${url} (${ip}) [${code}]`);
		}

		return callback();
	}
	catch(err) {
		callback(err);
	}
}

const Response = {

	/**
	 *
	 *
	 */
	success: function (res, data) {
		writeLog(res.req, 200, function (err) {});

		return res.status(200).json({
			data: data
		});
	},

	/**
	 *
	 *
	 */
	badRequest: function (res, message, errors) {
		writeLog(res.req, 400, function (err) {});

		return res.status(400).json({
			error: {
				code: 400,
				message: message || 'Bad request',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 *
	 */
	unauthorized: function (res, message, errors) {
		writeLog(res.req, 401, function (err) {});

		return res.status(401).json({
			error: {
				code: 401,
				message: message || 'Unauthorized',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 *
	 */
	forbidden: function (res, message, errors) {
		writeLog(res.req, 403, function (err) {});

		return res.status(403).json({
			error: {
				code: 403,
				message: message || 'Forbidden',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 *
	 */
	notFound: function (res, message, errors) {
		writeLog(res.req, 404, function (err) {});

		return res.status(404).json({
			error: {
				code: 404,
				message: message || 'Not found',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 *
	 */
	internalServerError: function (res, message, errors) {
		writeLog(res.req, 500, function (err) {});

		return res.status(500).json({
			error: {
				code: 500,
				message: message || 'Internal server error',
				errors: errors || []
			}
		});
	},
};

module.exports = Response;