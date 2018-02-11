import axios from 'axios';
import * as unless from 'express-unless';

export const checkAuth = (req, resp, next) => (req.session && req.session.userData) ? next() : resp.status(401).redirect('/index.html');

checkAuth['unless'] = unless;

export const login = (req, res) => {
    let fields = ['email', 'name'];
    try {
        console.log(`Login request: ${req.body.userID}`);
        let url = `https://graph.facebook.com/${req.body.userID}?access_token=${req.body.accessToken}&fields=${fields.join(',')}`;

        axios.get(url).then((resp) => {
            console.dir(resp.data);
            req.session.userData = resp.data;
            res.cookie('name', resp.data.name, { maxAge: 31536000000, httpOnly: false });
            res.sendStatus(201);
        }).catch(e => {
            res.sendStatus(401);
        });
    } catch (e) {
        res.sendStatus(500);
    }
};

export const logout = (req, res) => {
    console.log(`Cleared session for ${req.session.userData.email}`);
    delete req.session;
    res.clearCookie('name');
    res.sendStatus(201);
};