import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as cluster from 'cluster';
import * as os from 'os';
import axios from 'axios';

if (cluster.isMaster) {
    for (var i = 0; i < os.cpus().length; i += 1) {
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
    }

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
    }

    app.use(session(sess));

    app.all('/app/*', (req, resp, next) => (req.session && req.session.authorized) ? next() : resp.status(401).send());

    app.use(express.static('static'));

    app.use(bodyParser.json());



    app.get(['/', ''], (req, res) => res.redirect('/index.html'));
    app.post('/fb', (req, res) => {
        let fields = ['email', 'name'];
        try {
            let url = `https://graph.facebook.com/${req.body.userID}?access_token=${req.body.accessToken}&fields=${fields.join(',')}`;

            axios.get(url).then((resp) => {
                console.dir(resp.data);
                res.send("done");
            }).catch(e => {
                res.status(500).send(e);
            });
        } catch (e) { }
    });

    app.listen(port, () => console.log(`Server ${cluster.worker.id} listening on port ${port}`));
}
