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
	 */
	ok: function (res, data) {
		writeLog(res.req, 200, function (err) {});

		return res.status(200).json({
			data: data
		});
	},

	/**
	 *
	 */
	created: function (res, data) {
		writeLog(res.req, 201, function (err) {});

		return res.status(201).json({
			data: data
		});
	},

	/**
	 *
	 */
	noContent: function (res) {
		writeLog(res.req, 204, function (err) {});

		return res.status(204).json();
	},

	/**
	 *
	 */
	badRequest: function (res, code, message, errors) {
		writeLog(res.req, 400, function (err) {});

		return res.status(400).json({
			error: {
				code: code || 400000,
				message: message || 'Bad request',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	unauthorized: function (res, code, message, errors) {
		writeLog(res.req, 401, function (err) {});

		return res.status(401).json({
			error: {
				code: code || 401000,
				message: message || 'Unauthorized',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	forbidden: function (res, code, message, errors) {
		writeLog(res.req, 403, function (err) {});

		return res.status(403).json({
			error: {
				code: code || 403000,
				message: message || 'Forbidden',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	notFound: function (res, code, message, errors) {
		writeLog(res.req, 404, function (err) {});

		return res.status(404).json({
			error: {
				code: code || 404000,
				message: message || 'Not found',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	unsupportedMediaType: function (res, code, message, errors) {
		writeLog(res.req, 415, function (err) {});

		return res.status(415).json({
			error: {
				code: code || 415000,
				message: message || 'Unsupported media type',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	unprocessableEntity: function (res, code, message, errors) {
		writeLog(res.req, 422, function (err) {});

		return res.status(422).json({
			error: {
				code: code || 422000,
				message: message || 'Unprocessable entity',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	tooManyRequests: function (res, code, message, errors) {
		writeLog(res.req, 429, function (err) {});

		return res.status(429).json({
			error: {
				code: code || 429000,
				message: message || 'Too many request',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	internalServerError: function (res, code, message, errors) {
		writeLog(res.req, 500, function (err) {});

		return res.status(500).json({
			error: {
				code: code || 500000,
				message: message || 'Internal server error',
				errors: errors || []
			}
		});
	},

	/**
	 *
	 */
	serviceUnavailable: function (res, code, message, errors) {
		writeLog(res.req, 503, function (err) {});

		return res.status(503).json({
			error: {
				code: code || 503000,
				message: message || 'Service unavailable',
				errors: errors || []
			}
		});
	},
};

module.exports = Response;