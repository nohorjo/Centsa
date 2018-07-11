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
        req.session.userData = {
            ...details,
            ...(await Users.getOrCreateUser(details))
        };
        req.session.userData.original_user_id = req.session.userData.user_id;
        log('session', req.session);

        res.cookie('name', details.name, { maxAge: 31536000000, httpOnly: false });
        res.sendStatus(201);
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

export const loginScript = (req, resp) => {
    resp.status(200).send(
        `(${
           `() => {
                const authUrl = '/login';
                window.fbInit = () => {
                    const initConfig = {
                        appId: 'FB_APP_ID',
                        cookie: true,
                        xfbml: true,
                        version: 'v2.11'
                    };

                    window.checkLoginState = () => {
                        FB.getLoginStatus(response => {
                            if (response.authResponse) {
                                loginRequest(response.authResponse,() => { FB.getLoginStatus(() => { FB.logout(); }); });
                            }
                        });
                    };

                    window.fbAsyncInit = () => {
                        FB.init(initConfig);
                        FB.AppEvents.logPageView();
                    };

                    (function (d, s, id) {
                        let js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) return;
                        js = d.createElement(s);
                        js.id = id;
                        js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1'
                                    + '&version=' + initConfig.version
                                    + '&appId=' + initConfig.appId
                                    + '&autoLogAppEvents=1';
                        fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                };

                window.logout = () => {
                    $.ajax({
                        url: authUrl,
                        type: 'DELETE',
                        success: () => window.location.pathname = "index.html"
                    });

                };

                window.onSignIn = googleUser => {
                    loginRequest({google_token:googleUser.getAuthResponse().id_token}, gapi.auth2.getAuthInstance().signOut);
                };

                function loginRequest(data, signOut) {
                    $.post({
                        url: authUrl,
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: () => {
                            signOut();
                            window.location.hash = "";
                            window.location.pathname = "main.html";
                        }
                    });
                }
            }`.replace('FB_APP_ID', process.env.FB_APP_ID)
        })()`
    );
};

const getDetailsFromGoogle = async token => {
    log('google auth');
    const {OAuth2Client} = require('google-auth-library');
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
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

