import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as os from 'os';
import * as MySQLStore from 'express-mysql-session';
import * as path from 'path';
import * as mysql from 'mysql';
import * as fbauth from './fbauth';
import * as fileUpload from 'express-fileupload';
import Accounts from './Accounts';
import Expenses from './Expenses';
import General from './General';
import Settings from './Settings';
import Transactions from './Transactions';
import Types from './Types';
import Connection from './Connection';

const cpus = os.cpus().length;

if (cluster.isMaster) {
    try { require('../config'); } catch (e) {/* Config not set or in environment */ }
    for (let v of [
        'SESSION_SECRET',
        'DB_IP',
        'DB_PORT',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'DB_CONNECTION_LIMIT'
    ]) {
        if (!process.env[v]) {
            console.error(`Incomplete configuration: ${v}`);
            process.exit(1);
        }
    }

    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }
} else {

    Connection.init(Object.assign({ cpusCount: cpus }, process.env));

    const port = process.env.PORT || 8080;

    const app = express();

    const sess = {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        unset: 'destroy',
        cookie: { maxAge: 31536000000, httpOnly: true },
        store: new MySQLStore({ createDatabaseTable: true }, Connection.pool)
    };

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
    }

    app.use(express.json());
    app.use(cookieParser());
    app.use(session(sess));
    app.use(fileUpload());

    app.get('/index.html', fbauth.authSkipLogin);
    app.use(fbauth.checkAuth['unless']({
        path: ['/fb', '/index.html'],
        ext: ['css', 'js', 'svg', 'ico', 'gif']
    }));

    app.get(['/', ''], (req, res) => res.redirect('/index.html'));
    app.delete('/fb', fbauth.logout);
    app.post('/fb', fbauth.login);

    app.use('/api', [
        Accounts,
        Expenses,
        General,
        Settings,
        Transactions,
        Types
    ]);

    app.use(express.static(path.join(__dirname, '..', 'static')));

    app.listen(port, () => console.log(`Server ${cluster.worker.id} listening on port ${port}`));
}
