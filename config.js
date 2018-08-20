'use strict';
exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    'mongodb://avanichyanukroh:alvin12345@ds227352.mlab.com:27352/warp-zone-api';
exports.TEST_DATABASE_URL = 
	process.env.TEST_DATABASE_URL || 
	'mongodb://avanichyanukroh:alvin12345@ds125872.mlab.com:25872/warp-zone-api-test';
exports.PORT = process.env.PORT || 8000;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.JWT_SECRET = process.env.JWT_SECRET || "secret";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';