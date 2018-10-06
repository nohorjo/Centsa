import axios from 'axios';
import * as Users from './Users';
import * as UsersDao from './dao/Users';
import log from './log';
import { createHash } from 'crypto';
import { setSetting } from './dao/Settings';

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
        const { body: data } = req;
        let details, newManualUser;
        if (data.google_token) {
            details = await getDetailsFromGoogle(data.google_token);
        } else if (data.manual) {
            await authenticateUser(data);
            newManualUser = true;
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

        if (newManualUser) {
            const { user_id }  = req.session.userData;
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
        res.status(e == "Unauthorized" ? 401 : 500).send(e.toString());
    }
};

export const logout = (req, res) => {
    const { userData } = req.session;
    req.session.destroy(() => {
        log(`Cleared session for ${userData.email}`);
        res.clearCookie('name');
        res.clearCookie('currentUser');
        res.clearCookie('connect.sid');
        res.sendStatus(201);
    });
};

export const loginScript = (req, resp) => {
    resp.status(200).send(
        `(() => {
                const authUrl = '/login';
                window.fbInit = () => {
                    const initConfig = {
                        appId: '${process.env.FB_APP_ID}',
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

                window.googleInit = () => gapi.load('auth2', () => {
                    gapi.auth2.init({client_id: '${process.env.GOOGLE_CLIENT_ID}'});
                    gapi.signin2.render('g-signin2', {onsuccess: window.onSignIn});
                });

                window.login = isNew => {
                    if (!isNew || $('#newPassword').val() == $('#confirmPassword').val()) {
                        loginRequest({
                            isNew,
                            manual: true,
                            name: $('#name').val(),
                            email: $(isNew ? '#newEmail' : '#email').val(),
                            password: $(isNew ? '#newPassword' : '#password').val()
                        });
                    }
                };

                window.validatePassword = () => {
                    if ($('#newPassword').val() != $('#confirmPassword').val()) {
                        $('#newPassword').addClass('alert-danger');
                        $('#confirmPassword').addClass('alert-danger')
                        $('#signup').attr('disabled', true);
                    } else {
                        $('#newPassword').removeClass('alert-danger');
                        $('#confirmPassword').removeClass('alert-danger')
                        $('#signup').attr('disabled', false);
                    }
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
                            signOut && signOut();
                            window.location.hash = "";
                            window.location.pathname = "main.html";
                        },
                        error: message => swal("Error", message.responseText, "error")
                  });
                }
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
    return (({name,email})=>({name,email}))(ticket.getPayload() || {});
};

const getDetailsFromFB = async ({userID, accessToken}:any = {}) => {
    const fields = ['email', 'name'];
    log('Login request: %s', userID);
    const url = `https://graph.facebook.com/${userID}?access_token=${accessToken}&fields=${fields.join(',')}`;

    return (await axios.get(url)).data;
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
