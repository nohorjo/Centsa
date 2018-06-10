import debug from 'debug';

const log = debug('centsa:log');
log.debug = debug('centsa:debug');
log.warn = debug('centsa:warn');
log.error = debug('centsa:error');

export default log;
