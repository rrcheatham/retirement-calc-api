exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://newuser1:2yHw9kwk@ds123562.mlab.com:23562/goodlife-db';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://newuser1:2yHw9kwk@ds223812.mlab.com:23812/goodlife-db-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;