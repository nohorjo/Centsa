import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as os from 'os';
import * as fbauth from './fbauth';

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
    const port = process.env.PORT || 8080;

    const app = express();

    const sess = {
        secret: Math.random().toString(),
        resave: false,
        saveUninitialized: false,
        unset:'destroy',
        cookie: { maxAge: Number.MAX_VALUE, httpOnly: true }
    };

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
    }
    app.use(express.json());
    app.use(cookieParser());
    app.use(session(sess));

    app.all('/app/*', fbauth.checkAuth);

    app.get(['/', ''], (req, res) => res.redirect('/index.html'));
    app.delete('/fb', fbauth.logout);
    app.post('/fb', fbauth.login);

    app.use(express.static('static'));

    app.listen(port, () => console.log(`Server ${cluster.worker.id} listening on port ${port}`));
}
