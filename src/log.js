const debug = require('debug');

const log = debug('centsa:log');
log.debug = debug('centsa:debug');
log.warn = debug('centsa:warn');
log.error = debug('centsa:error');

const log = {};

export default log;

module.exports = log;
