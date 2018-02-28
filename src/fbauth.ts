import axios from 'axios';
import * as unless from 'express-unless';
import * as Users from './Users';

export const checkAuth = (req, resp, next) => (req.session && req.session.userData) ? next() : resp.status(401).redirect('/index.html');

export const authSkipLogin = (req, resp, next) => (req.session && req.session.userData) ? resp.redirect('/main.html') : next();

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
            Users.getOrCreateUser(resp.data, id => {
                req.session.userData.user_id = id;
                res.sendStatus(201);
            });
        }).catch(e => {
            res.status(500).send(e.toString());
        });
    } catch (e) {
        res.status(500).send(e.toString());
    }
};

export const logout = (req, res) => {
    console.log(`Cleared session for ${req.session.userData.email}`);
    delete req.session;
    res.clearCookie('name');
    res.sendStatus(201);
};