import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as os from 'os';
import * as path from 'path';
import * as fbauth from './fbauth';
import * as fileUpload from 'express-fileupload';
import Accounts from './Accounts';
import Expenses, { applyAutoTransactions } from './Expenses';
import General from './General';
import Settings from './Settings';
import Transactions from './Transactions';
import Types from './Types';
import { testConnection } from './dao/Connection';
import debug from './debug';

const cpus = os.cpus().length;

const initWorker = (id, env) => {
    testConnection();

    if (id == 1) {
        applyAutoTransactions(true);
        setInterval(applyAutoTransactions, 8.64e7);
    }

    const port = env.PORT || 8080;

    const app = express();
    const FileStore = require('session-file-store')(session);
    const sess = {
        secret: env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        unset: 'destroy',
        cookie: { maxAge: 31536000000, httpOnly: true },
        store: new FileStore({ ttl: 31536000 })
    };

    if (env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
        app.use((req, res, next) => req.secure ? next() : res.redirect(`https://${req.hostname}${req.originalUrl}`));
    }

    app.use(express.json({ limit: '10MB' }));
    app.use(cookieParser());
    app.use(session(sess));
    app.use(fileUpload());

    app.post('/google', (req, res) => {
       	const {OAuth2Client} = require('google-auth-library');
	const Users = require('./Users');
	const CLIENT_ID = '760035206518-mt38hjblfp202e0gsqioovoi2bq4svll.apps.googleusercontent.com';
	const client = new OAuth2Client(CLIENT_ID);
	async function verify() {
	    const ticket = await client.verifyIdToken({
	    idToken: req.body.token,
	    audience: '760035206518-mt38hjblfp202e0gsqioovoi2bq4svll.apps.googleusercontent.com'
	    });
	    const data = (({name,email})=>({name,email}))(ticket.getPayload());
	    console.dir(data);
	    req.session.userData = data;
	    res.cookie('name', data.name, { maxAge: 31536000000, httpOnly: false });
	    Users.getOrCreateUser(data, id => {
		req.session.userData.user_id = id;
		res.sendStatus(201);
	    });
	}
        verify().catch(e => res.status(500).send(e.toString()));
    });

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
            console.error(`Incomplete configuration from env: ${v}`);
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
