'use strict';
exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    'mongodb://localhost/warp-zone-api';
exports.TEST_DATABASE_URL = 
	process.env.TEST_DATABASE_URL || 
	'mongodb://localhost/warp-zone-api-test';
module.exports = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};