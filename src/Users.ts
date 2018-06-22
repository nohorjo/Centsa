import * as dao from './dao/Users';
import log from './log';

export const getOrCreateUser = (data, cb) => {
    dao.getId(data.email, (err, id) => {
        if (err) throw err;
        if (id) {
            log('returning existing user');
            cb(id);
        } else {
            dao.insert(data.name, data.email, (err, userId) => {
                if (err) throw err;
                log('setting up new user');
                dao.setUpUser(userId, err => {
                    if (err) throw err;
                    log('returning user');
                    cb(userId);
                });
            });
        }
    });
};
