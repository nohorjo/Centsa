import * as dao from './dao/Users';
import log from './log';

export const getOrCreateUser = (data, cb) => {
    return new Promise((resolve, reject) => {
        dao.getId(data.email, (err, id) => {
            if (err) {
                reject(err);
            } else if (id) {
                log('returning existing user');
                resolve(id);
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
                                resolve(userId);
                            }
                        });
                    }
                });
            }
        });
    });
};
