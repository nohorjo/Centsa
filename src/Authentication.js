const fetch = require('node-fetch');
const _ = require('underscore');

const Users = require('./Users');
const UsersDao = require('./dao/Users');
const log = require('./log');
const { createHash } = require('crypto');
const { setSetting } = require('./dao/Settings');

log('init authentication');

const Authentication = {};

Authentication.checkAuth = (req, resp, next) => {
    if (req.session && req.session.userData) {
        next();
    } else {
        log.warn('unauthorized %s', req.ip);
        resp.sendStatus(401);
    }
};

Authentication.authSkipLogin = (req, resp, next) => (req.session && req.session.userData) ? resp.redirect('/main.html') : next();

Authentication.login = async (req, res) => {
    try {
        const { body: data } = req;
        let details;
        if (data.google_token) {
            details = await getDetailsFromGoogle(data.google_token);
        } else if (data.manual) {
            await authenticateUser(data);
            details = {
                email: data.email,
                name: data.name
            };
        } else {
            details = await getDetailsFromFB(data);
        }
        req.session.userData = {
            ...details,
            ...(await Users.getOrCreateUser(details))
        };

        if (data.manual) {
            const { user_id }  = req.session.userData;
            // update password hash with user ID
            await new Promise((resolve, reject) => {
                UsersDao.updatePassword(
                    user_id,
                    {
                        newPassword: createHash('sha256').update(user_id.toString() + data.password).digest('base64')
                    },
                    err => err ? reject(err) : resolve()
                );
            });
            await new Promise((resolve, reject) => {
                setSetting(
                    {
                        key: 'password.set',
                        value: true
                    },
                    user_id,
                    err => err ? reject(err) : resolve()
                );
            });
        }

        req.session.userData.original_user_id = req.session.userData.user_id;
        log('session', req.session);

        res.cookie('name', req.session.userData.name, { maxAge: 31536000000, httpOnly: false });
        res.clearCookie('currentUser');
        res.sendStatus(201);
    } catch (e) {
        log.error(e);
        res.status(e == 'Unauthorized' ? 401 : 500).send(e.toString());
    }
};

Authentication.logout = (req, res) => {
    const { userData } = req.session;
    req.session.destroy(() => {
        log(`Cleared session for ${userData.email}`);
        res.clearCookie('name');
        res.clearCookie('currentUser');
        res.clearCookie('connect.sid');
        res.sendStatus(201);
    });
};

Authentication.appIds = (req, resp) => resp.status(200).send({
    FB_APP_ID: process.env.FB_APP_ID,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
});

const getDetailsFromGoogle = async token => {
    log('google auth');
    const {OAuth2Client} = require('google-auth-library');
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const ticket = await new OAuth2Client(CLIENT_ID).verifyIdToken({
        idToken: token,
        audience: CLIENT_ID 
    });
    return _.pick(ticket.getPayload(), 'name', 'email');
};

const getDetailsFromFB = async ({userID, accessToken} = {}) => {
    const fields = ['email', 'name'];
    log('Login request: %s', userID);
    const url = `https://graph.facebook.com/${userID}?access_token=${accessToken}&fields=${fields.join(',')}`;

    return fetch(url).then(r => r.json());
};

const authenticateUser = async data => {
    const { user_id = 0, password } = await Users.getIdPassword(data.email);
    const hashed = createHash('sha256').update(user_id.toString() + data.password).digest('base64');
    if (
        (user_id && (data.isNew || hashed !== password))
        || (!user_id && !data.isNew)
    ) {
        throw 'Unauthorized';
    }
};

module.exports = Authentication;
