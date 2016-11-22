'use strict';

/**
 * Router
 *
 */

const express = require('express');
const path    = require('path');
const app     = require('./app');
const routes  = {};

const appDir  = path.join(`${__dirname}./../../../app`);

/**
 *
 *
 */
const Router  = (function() {

	var newInstance = null;

	/**
	*
	*
	*/
	const Router = function(namespace = '', prefix = '', router = app) {
		this.namespace = namespace;
		this.prefix = prefix;
		this.router = router;
		this.hasRoute = false;
	};

	/**
	*
	*
	*/
	Router.prototype.get = function(config, paramA, paramB) {
		this.route('get', config, paramA, paramB);

		return this;
	};

	/**
	*
	*
	*/
	Router.prototype.post = function(config, paramA, paramB) {
		this.route('post', config, paramA, paramB);

		return this;
	};

	/**
	*
	*
	*/
	Router.prototype.put = function(config, paramA, paramB) {
		this.route('put', config, paramA, paramB);

		return this;
	};

	/**
	*
	*
	*/
	Router.prototype.patch = function(config, paramA, paramB) {
		this.route('patch', config, paramA, paramB);

		return this;
	};

	/**
	*
	*
	*/
	Router.prototype.delete = function(config, paramA, paramB) {
		this.route('delete', config, paramA, paramB);

		return this;
	};

	/**
	*
	*
	*/
	Router.prototype.all = function(config, paramA, paramB) {
		this.route('all', config, paramA, paramB);

		return this;
	};

	/**
	*
	*
	*/
	Router.prototype.group = function(config, paramA, paramB) {
		try {
			config = parseConfig(this.namespace, config);

			let router = express.Router({mergeParams: true});
			this.router.use(config.prefix, router);
			this.newInstance = new Router(config.namespace, `${this.prefix}${config.prefix}`, router);

			// middleware is not exists
			if(typeof paramB === 'undefined') {
				paramA(this.newInstance);
			}
			else {
				var middlewares = loadMiddleware(paramA);
				for(var i = 0, len = middlewares.length; i < len; i++) {
					router.use(middlewares[i]);
				}

				paramB(this.newInstance);
			}

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.resource = function(config, paramA, paramB, paramC) {
		try {
			var param = (config.param) ? `/:${config.param}` : '/:id';

			config = parseConfig(this.namespace, config);

			var loaded = loadControllerAndMiddleware(config, paramA, paramB);

			const crud = {
				index: {method: 'get', hasParam: false},
				show: {method: 'get', hasParam: true},
				store: {method: 'post', hasParam: false},
				update: {method: 'put', hasParam: true},
				destroy: {method: 'delete', hasParam: true},
			};

			const controller = loaded.controller;
			const crudMethods = (controller.resources) ? Object.keys(crud).filter(x => controller.resources.indexOf(x) > -1) : Object.keys(crud);

			for(var i = 0, len = crudMethods.length; i < len; i++) {
				if(controller[crudMethods[i]]) {
					this.hasRoute = true;
					var method = crudMethods[i];
					var prefix = config.prefix + ((crud[method].hasParam) ? param : '');
					var routeFunction = controller[method].bind(controller);

					declareRoute(this.prefix, crud[method].method, prefix);

					if(!loaded.insMiddlewares[method]) {
						if(loaded.middlewares) 
							this.router[crud[method].method](prefix, loaded.middlewares, routeFunction);
						else 
							this.router[crud[method].method](prefix, routeFunction);
					}
					else {
						let nMiddlewares = (loaded.middlewares) ? loaded.insMiddlewares[method].concat(loaded.middlewares) : loaded.insMiddlewares[method];
						this.router[crud[method].method](prefix, nMiddlewares, routeFunction);
					}
				}
			}

			if(typeof paramC !== 'undefined' && typeof paramC === 'function') this.group(config.prefix, paramA, paramC);
			else if(typeof paramC === 'undefined' && typeof paramB === 'function') this.group(config.prefix, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.route = function(method, config, paramA, paramB) {
		try {
			config = parseConfig(this.namespace, config);
			declareRoute(this.prefix, method, config.prefix);

			this.hasRoute = true;

			// middleware is not exists
			if(typeof paramB === 'undefined') {
				const controller = (typeof paramA === 'function') ? paramA : loadController(config.namespace, paramA);
				this.router[method](config.prefix, controller);
			}
			else {
				const controller = (typeof paramB === 'function') ? paramB : loadController(config.namespace, paramB);
				const middleware = (typeof paramA === 'function') ? paramA : loadMiddleware(paramA);
				this.router[method](config.prefix, middleware, controller);
			}

			return this;
		}
		catch(err) {
		 	throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.error = function(handler) {
		try {
			if(typeof handler !== 'function') {
				const errHandler = require('./error-handler');
				handler = errHandler[handler];
			}

			if(!this.hasRoute && !this.newInstance) {
				throw new Error('Error handler cannot be assigned on empty route');
			}
			else if(!this.hasRoute && this.newInstance) {
				this.newInstance.error(handler);
				this.newInstance = null;
			}
			else {
				this.router.use(handler);
				this.newInstance = null;
			}

			return null;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var loadControllerAndMiddleware = function(config, paramA, paramB) {
		try {
			if(typeof paramB === 'undefined' || typeof paramB === 'function') {
				var Controller = require(`${appDir}/controllers${config.namespace}/${paramA}`);
				var middlewares = null; 
			}
			else {
				var Controller = require(`${appDir}/controllers${config.namespace}/${paramB}`);
				var middlewares = loadMiddleware(paramA); 
			}

			const instance = new Controller();
			const methods = Object.getOwnPropertyNames(Controller.prototype);

			var insMiddlewares = {};
			if(instance.middleware) {
				var midMethods = Object.getOwnPropertyNames(instance.middleware);
				for(var i = 0; i < midMethods.length; i++) {
					for(var j = 0, len = instance.middleware[midMethods[i]].length; j < len; j++) {
						var key = instance.middleware[midMethods[i]][j];
						if(!insMiddlewares[key]) insMiddlewares[key] = [];
						insMiddlewares[key].push(loadMiddleware(midMethods[i])[0]); 
					}
				}
			}

			return { controller: instance, methods: methods, middlewares: middlewares, insMiddlewares: insMiddlewares };
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var declareRoute = function(mPrefix, method, prefix) {
		try {
			const key = `${method.toUpperCase()}\t${mPrefix}${prefix}`;

			if(routes[key]) 
				throw new Error(`Cannot redeclare prefix ${method.toUpperCase()} '${mPrefix}${prefix}'`);

			routes[key] = 1;

			if(env('APP_DEBUG', 'true') == 'true') console.info(`Route : ${key}`);

			return;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var parseConfig = function(mNamespace, config = '') {
		try {
			if(typeof config === 'string') {
				return {
					namespace: mNamespace,
					prefix: config,
					options: {}
				};
			}
			else {
				return {
					namespace: (config.namespace) ? `${mNamespace}/${config.namespace}` : `${mNamespace}`,
					prefix: (config.prefix) ? config.prefix : '/',
					options: config.options || {}
				};
			}
		}
		catch(err) {
		  throw err;
		}
	};

	/**
	*
	*
	*/
	var loadController = function(namespace, controller) {
		try {
			const split = controller.split('.');
			var Controller = require(`${appDir}/controllers${namespace}/${split[0]}`);
			const instance = new Controller();

			return instance[split[1]];
		}
		catch(err) {
			throw err;
		}
	}

	/**
	*
	*
	*/
	var loadMiddleware = function(middlewares) {
		try {
			var arrMiddlewares = [];

			if(typeof middlewares !== 'object') {
				middlewares = [middlewares];
			}

			for(var i = 0, len = middlewares.length; i < len; i++) {
				if(typeof middlewares[i] === 'function') {
					arrMiddlewares.push(middlewares[i]);
				}
				else {
					const Middleware = require(`${appDir}/middleware/${middlewares[i]}`);
					let middleware = new Middleware();

					if(!middleware.handle) throw new Error(`${split[0]} is not a middleware function, handle() method not found`);

					arrMiddlewares.push(middleware.handle);
				}
			}

			return arrMiddlewares;
		}
		catch(err) {
			throw err;
		}
	};

	return Router;

})();

module.exports = new Router();