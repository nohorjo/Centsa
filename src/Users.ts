import * as dao from './dao/Users';
import log from './log';

export const getOrCreateUser = data => {
    return new Promise((resolve, reject) => {
        dao.getUserAETs(data.email, (err, user) => {
            if (err) {
                reject(err);
            } else if (user) {
                log('returning existing user');
                resolve(user);
            } else {
                dao.insert(data.name, data.email, (err, userId) => {
                    if (err) {
                        reject(err);
                    } else {
                        log('setting up new user');
                        dao.setUpUser(userId, err => {
                            if (err) {
                                reject(err);
                            } else {
                                log('returning user');
                                dao.getUserAETs(data.email, (err, user) => {
                                    if (err) reject(err);
                                    else resolve(user);
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};

export const getIdPassword = email => {
    return new Promise((resolve, reject) => {
        dao.getIdPassword(email, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const [ existing = {} ] = result;
                resolve({
                    user_id: existing.id,
                    password: existing.password
                });
            }
        });
    });
};
