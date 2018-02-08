import * as express from 'express';
import * as session from 'express-session';
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
        cookie: {}
    };

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
    }

    app.use(session(sess));

    app.all('/app/*', fbauth.checkAuth);

    app.use(express.static('static'));

    app.use(express.json());

    app.get(['/', ''], (req, res) => res.redirect('/index.html'));
    app.post('/fb', fbauth.auth);

    app.listen(port, () => console.log(`Server ${cluster.worker.id} listening on port ${port}`));
}
