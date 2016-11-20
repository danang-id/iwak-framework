'use strict';

/**
 * Form Validator
 *
 */

const validator  = require('validator');

/**
 *
 */
validator.xIsMin = function(data, min = 1, isInt) {
	if(isInt)
		return (parseInt(data) >= min);
	else if(data.length)
		return (data.length >= min);
	else
		return false;
};

/**
 *
 */
validator.xIsMax = function(data, max = 1, isInt) {
	if(isInt)
		return (parseInt(data) <= max);
	else if(data.length)
		return (data.length <= max);
	else
		return false;
};

/**
 * http://stackoverflow.com/a/2048572
 */
validator.xIsTime = function(data) {
	return (data.match(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/)) ? true : false;
};

/**
 *
 */
validator.xIsString = function(data) {
	return (data.search(/[a-zA-Z]/) != -1);
};

/**
 *
 */
const rules = {
	email: 'isEmail',
	URL: 'isURL',
	isMACAddress: 'isMACAddress',
	IP: 'isIP',
	FQDN: 'isFQDN',
	boolean: 'isBoolean',
	alpha: 'isAlpha',
	alphanumeric: 'isAlphanumeric',
	numeric: 'isNumeric',
	lowercase: 'isLowercase',
	uppercase: 'isUppercase',
	ascii: 'isAscii',
	fullWidth: 'isFullWidth',
	halfWidth: 'isHalfWidth',
	variableWidth: 'isVariableWidth',
	multibyte: 'isMultibyte',
	surrogatePair: 'isSurrogatePair',
	int: 'isInt',
	integer: 'isInt',
	float: 'isFloat',
	decimal: 'isDecimal',
	hexadecimal: 'isHexadecimal',
	divisibleBy: 'isDivisibleBy',
	hexColor: 'isHexColor',
	JSON: 'isJSON',
	null: 'isNull',
	length: 'isLength',
	byteLength: 'isByteLength',
	UUID: 'isUUID',
	date: 'isDate',
	after: 'isAfter',
	before: 'isBefore',
	in: 'isIn',
	creditCard: 'isCreditCard',
	ISIN: 'isISIN',
	ISBN: 'isISBN',
	mobilePhone: 'isMobilePhone',
	currency: 'isCurrency',
	ISO8601: 'isISO8601',
	base64: 'isBase64',
	dataURI: 'isDataURI',
	min: 'xIsMin',
	max: 'xIsMax',
	string: 'xIsString',
	time: 'xIsTime'
};

/**
 *
 */
const schemasCache = {};

/**
 *
 */
const getSchema = function (rules) {
	var cacheKey = JSON.stringify(rules);

	if(schemasCache[cacheKey]) {
		return schemasCache[cacheKey];
	}

	var keys = Object.keys(rules);
	var objSchema = {};

	for(var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var rule = (Array.isArray(rules[key])) ? rules[key] : [rules[key], ''];
		var expRule = rule[0].split('|');

		objSchema[key] = {
			isRequired: false,
			isInteger: false
		};

		var arrRules = [];
		for(var j = 0; j < expRule.length; j++) {
			if(expRule[j] === 'int' || expRule[j] === 'integer') objSchema[key].isInteger = true;
			if(expRule[j] === 'required') {
				objSchema[key].isRequired = true;
			}
			else {
				var expElem = expRule[j].split(':');
				var ruleValue = (expElem[0] === 'in') ? expElem[1].split(',') : (expElem[1] || null);
				arrRules.push({type: expElem[0], value: ruleValue});
			}
		}
		objSchema[key].rules = arrRules;
		objSchema[key].message = (rule[1] && rule[1] !== '') ? rule[1] : null;
	}

	schemasCache[cacheKey] = objSchema;

	return objSchema;
};

/**
 *
 */
const getError = function(property, rule, message) {
	return {
		property: property,
		type: `${rule.type}Error`,
		message: message || `Property '${property}' should be ${rule.type}` + ((rule.value) ? `:${rule.value}` : '')
	};
};

/**
 *
 */
const getResult = function(data, errors) {
	return {
		error : function() {
			return (errors && errors.length > 0) ? true : false;
		},
		messages : function() {
			return errors || [];
		},
		get : function(key, defVal) {
			if(!key) return data;
			else return data[key] || defVal;
		}
	};
};

/**
 *
 */
const validateSchema = function(objData, property, schema) {
	var data = objData[property];

	if(schema.isRequired) {
		if(!data || data.length === 0) return getError(property, {type: 'required'}, `Property '${property}' is required`);
	}
	else {
		if(!data || data.length === 0) return null;
	}

	for(var i = 0; i < schema.rules.length; i++) {
		var schemaRules = schema.rules[i];
		var ruleKey = rules[schemaRules.type];

		if(!((schemaRules.value) ? validator[ruleKey](String(data), schemaRules.value, schema.isInteger) : validator[ruleKey](String(data)))) {
			return getError(property, schemaRules, schema.message);
		}
	}

	return null;
};

let Validator = {};

/**
 *
 */
Validator.validate = function(data, rules, filter) {
	var schema = getSchema(rules);
	var schemaKeys = Object.keys(schema);
	var errors = [];
	var filteredData = {};

	for(var i = 0; i < schemaKeys.length; i++) {
		var key = schemaKeys[i];
		var error = validateSchema(data, key, schema[key]);
		if(error) errors.push(error);
		if(data[key]) {
			filteredData[key] = data[key];
		}
	}

	return getResult((filter) ? filteredData : data, errors);
};

/**
 *
 */
Validator.all = function(req, rules, filter = true) {
	return Validator.validate(Object.assign(Object.assign(req.query, req.body), req.params), rules, filter);
};

/**
 *
 */
Validator.params = function(req, rules, filter = true) {
	return Validator.validate(req.params, rules, filter);
};

/**
 *
 */
Validator.body = function(req, rules, filter = true) {
	return Validator.validate(req.body, rules, filter);
};

/**
 *
 */
Validator.query = function(req, rules, filter = true) {
	return Validator.validate(req.query, rules, filter);
};

module.exports = Validator;