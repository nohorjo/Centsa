import * as mysql from 'mysql';

const connection = {
    pool: null,
    init(config) {
        const connection = mysql.createConnection({
            host: config.DB_IP,
            port: config.DB_PORT,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_NAME
        });

        connection.connect();
        connection.on('error', (e) => {
            console.error('error connecting to db', e);
            process.exit(1);
        });
        connection.end();
        this.pool = mysql.createPool({
            connectionLimit: Math.floor(config.cpusCount / config.DB_CONNECTION_LIMIT),
            host: config.DB_IP,
            port: config.DB_PORT,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_NAME,
            multipleStatements: true
        });
    }
}
export default connection;

const exitHandler = () => connection.pool && connection.pool.end();

process.on('exit', exitHandler);
