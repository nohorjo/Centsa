const mysql = require('mysql');
const os = require('os');
const log = require('../log');

log('init db connection');

const cpus = os.cpus().length;
const config = {
    cpusCount: cpus,
    ...process.env
};

const Connection = {};

Connection.testConnection = () => {
    log('test connection');
    const connection = mysql.createConnection({
        host: config.DB_IP,
        port: parseInt(config.DB_PORT),
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME
    });

    connection.connect();
    connection.on('error', e => {
        log.error('Error connecting to database', e);
        process.exit(1);
    });
    connection.end();
};

Connection.pool = mysql.createPool({
    connectionLimit: Math.floor(parseInt(config.DB_CONNECTION_LIMIT) / config.cpusCount) || 1,
    host: config.DB_IP,
    port: parseInt(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    multipleStatements: true
});

log('pool created');

process.on('exit', () => {
    log('shutting down pool');
    Connection.pool.end();
});

module.exports = Connection;
