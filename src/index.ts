import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as os from 'os';
import * as MySQLStore from 'express-mysql-session';
import * as path from 'path';
import * as fs from 'fs';
import * as Authentication from './Authentication';
import * as fileUpload from 'express-fileupload';
import Accounts from './Accounts';
import Expenses, { applyAutoTransactions } from './Expenses';
import General from './General';
import Settings from './Settings';
import Transactions from './Transactions';
import Types from './Types';
import { testConnection, pool } from './dao/Connection';
import debug from './debug';
import log from './log';

const cpus = os.cpus().length;

let sessionStore;

export const getSessionStore = () => sessionStore;

const initWorker = (id, env) => {
    testConnection();

    if (id == 1) {
        log('applying auto transactions');
        applyAutoTransactions(true);
        setInterval(applyAutoTransactions, 8.64e7);
    }

    const port = env.PORT || 8080;

    const app = express();

    sessionStore = new MySQLStore({ createDatabaseTable: true }, pool);
    const sess = {
        secret: env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        unset: 'destroy',
        cookie: { maxAge: 31536000000, httpOnly: true },
        store: sessionStore
    };

    if (env.NODE_ENV === 'production') {
        log('init production config');
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
        app.use((req, res, next) => req.secure ? next() : res.redirect(`https://${req.hostname}${req.originalUrl}`));
    }

    app.use(express.json({ limit: '10MB' }));
    app.use(cookieParser());
    app.use(session(sess));
    app.use(fileUpload());

    app.get('/index.html', Authentication.authSkipLogin);

    app.use(debug);
    app.get(['/', ''], (req, res) => res.redirect('/index.html'));
    app.use(Authentication.checkAuth['unless']({
        path: ['/login'],
        ext: ['css', 'js', 'svg', 'ico', 'gif', 'html']
    }));

    app.delete('/login', Authentication.logout);
    app.post('/login', Authentication.login);

    app.use('/api', [
        Accounts,
        Expenses,
        General,
        Settings,
        Transactions,
        Types
    ]);

    app.use(express.static(path.join(__dirname, '..', 'static')));

    app.listen(port, () => log(`Server ${id} listening on port ${port}`));
};
const checkConfig = env => {
    for (let v of [
        'SESSION_SECRET',
        'DB_IP',
        'DB_PORT',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'DB_CONNECTION_LIMIT'
    ]) {
        if (!env[v]) {
            log.error(`Incomplete configuration from env: ${v}`);
            process.exit(1);
        }
    }
};

const main = (env, isMaster) => {
    if (env.NODE_ENV == "debug") {
        checkConfig(env);
        initWorker(1, env);
    } else {
        if (isMaster) {
            checkConfig(env);
            for (let i = 0; i < cpus; i++) {
                cluster.fork();
            }
        } else {
            initWorker(cluster.worker.id, env);
        }
    }
};

main(process.env, cluster.isMaster);
