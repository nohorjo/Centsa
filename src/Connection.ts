import * as mysql from 'mysql';
import * as os from 'os';

const cpus = os.cpus().length;

export const pool = mysql.createPool({
    connectionLimit: Math.floor(cpus / parseInt(process.env.DB_CONNECTION_LIMIT)),
    host: process.env.DB_IP,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export const test = () => {
    const connection = mysql.createConnection({
        host: process.env.DB_IP,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect();
    connection.on('error', (e) => {
        console.error('Error connecting to db', e);
        process.exit(1);
    });
    connection.end();
}

const exitHandler = () => pool.end();

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);