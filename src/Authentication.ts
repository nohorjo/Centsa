import axios from 'axios';
import * as Users from './Users';
import log from './log';

log('init authentication');

export const checkAuth = (req, resp, next) => {
    if (req.session && req.session.userData) {
        next();
    } else {
        log.warn('unauthorized %s', req.ip);
        resp.sendStatus(401);
    }
};

export const authSkipLogin = (req, resp, next) => (req.session && req.session.userData) ? resp.redirect('/main.html') : next();

export const login = async (req, res) => {
    try {
        let details;
        if(req.body.google_token) {
            details = await getDetailsFromGoogle(req.body.google_token);
        } else {
            details = await getDetailsFromFB(req.body);
        }
        log('%O', details);
        req.session.userData = details;
        res.cookie('name', details.name, { maxAge: 31536000000, httpOnly: false });
        Users.getOrCreateUser(details, id => {
            req.session.userData.user_id = id;
            req.session.userData.original_user_id = id;
            res.sendStatus(201);
        });
    } catch (e) {
        log.error(e);
        res.status(500).send(e.toString());
    }
};

export const logout = (req, res) => {
    console.log(`Cleared session for ${req.session.userData.email}`);
    delete req.session;
    res.clearCookie('name');
    res.clearCookie('currentUser');
    res.sendStatus(201);
};

const getDetailsFromGoogle = async token => {
    log('google auth');
    const {OAuth2Client} = require('google-auth-library');
    const CLIENT_ID = '760035206518-mt38hjblfp202e0gsqioovoi2bq4svll.apps.googleusercontent.com';
    const ticket = await new OAuth2Client(CLIENT_ID).verifyIdToken({
        idToken: token,
        audience: CLIENT_ID 
    });
    return (({name,email})=>({name,email}))(ticket.getPayload());
};

const getDetailsFromFB = async ({userID, accessToken}) => {
    const fields = ['email', 'name'];
    log('Login request: %s', userID);
    const url = `https://graph.facebook.com/${userID}?access_token=${accessToken}&fields=${fields.join(',')}`;

    return (await axios.get(url)).data;
};
