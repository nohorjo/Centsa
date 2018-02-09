import axios from 'axios';

export const checkAuth = (req, resp, next) => (req.session && req.session.userData) ? next() : resp.status(401).redirect('/index.html');

export const login = (req, res) => {
    let fields = ['email', 'name'];
    try {
        let url = `https://graph.facebook.com/${req.body.userID}?access_token=${req.body.accessToken}&fields=${fields.join(',')}`;

        axios.get(url).then((resp) => {
            console.dir(resp.data);
            req.session.userData = resp.data;
            res.cookie('name', resp.data.name, { maxAge: Number.MAX_VALUE, httpOnly: true });
            res.sendStatus(201);
        }).catch(e => {
            res.sendStatus(401);
        });
    } catch (e) {
        res.sendStatus(500);
    }
};

export const logout = (req, res) => {
    // TODO: implement logout
};