'use strict';

/**
 * App configuration
 *
 */

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');
const path		 = require('path');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(helmet());

try {
	require(path.join(`${__dirname}/./../../../config/app`))(app);
}
catch(err) {
	throw new Error(`App configuration error: ${err.message}`);
}

app.use(express.static('public'));

module.exports = app;