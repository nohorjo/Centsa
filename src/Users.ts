import * as dao from './dao/Users';

export const getOrCreateUser = (data, cb) => {
    dao.getId(data.email, (err, id) => {
        if (err) throw err;
        if (id) {
            cb(id);
        } else {
            dao.insert(data.name, data.email, (err, userId) => {
                if (err) throw err;
                dao.setUpUser(userId, err => {
                    if (err) throw err;
                    cb(userId);
                });
            });
        }
    });
};