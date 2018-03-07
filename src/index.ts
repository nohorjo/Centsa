import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as os from 'os';
import * as path from 'path';
import * as mysql from 'mysql';
import * as fbauth from './fbauth';
import * as fileUpload from 'express-fileupload';
import Accounts from './Accounts';
import Expenses from './Expenses';
import { applyAutoTransactions } from './Expenses';
import General from './General';
import Settings from './Settings';
import Transactions from './Transactions';
import Types from './Types';
import Connection from './Connection';
import debug from './debug';

const cpus = os.cpus().length;

const initWorker = id => {
    Connection.init(Object.assign({ cpusCount: cpus }, process.env));

    if (id == 1) {
        applyAutoTransactions(true);
        setInterval(applyAutoTransactions, 8.64e7);
    }

    const port = process.env.PORT || 8080;

    const app = express();
    const FileStore = require('session-file-store')(session);
    const sess = {
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        unset: 'destroy',
        cookie: { maxAge: 31536000000, httpOnly: true },
        store: new FileStore({ ttl: 31536000 })
    };

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
        app.use((req, res, next) => req.secure ? next() : res.redirect(`https://${req.hostname}${req.originalUrl}`));
    }

    app.use(express.json());
    app.use(cookieParser());
    app.use(session(sess));
    app.use(fileUpload());

    app.get('/index.html', fbauth.authSkipLogin);

    app.use(debug);
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

    app.listen(port, () => console.log(`Server ${id} listening on port ${port}`));
}
const loadConfig = () => {
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
}

if (process.env.NODE_ENV == "debug") {
    loadConfig();
    initWorker(1);
} else {
    if (cluster.isMaster) {
        loadConfig();
        for (let i = 0; i < cpus; i++) {
            cluster.fork();
        }
    } else {
        initWorker(cluster.worker.id);
    }
}