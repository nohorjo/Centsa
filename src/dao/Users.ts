import { pool } from './Connection';

export const getUserAETs = (emailOrId, cb) => {
    const getId = `SELECT ${isNaN(emailOrId) ? 'id FROM users WHERE email=?' : `${emailOrId} AS id`}`;
    pool.query(
        `${getId};
        SELECT id, name FROM accounts WHERE user_id=(${getId});
        SELECT id, name, type_id FROM expenses WHERE user_id=(${getId});
        SELECT id, name FROM types WHERE user_id=(${getId});`, 
        Array(4).fill(emailOrId),
        (err, data) => {
            if (err) {
                cb(err);
            } else if (!data[0][0]) {
                cb();
            } else {
                cb(null, {
                    user_id: data[0][0].id,
                    accounts: data[1],
                    expenses: data[2],
                    types: data[3]
                });
            }
        }
    );
};

export const insert = (name, email, cb) => {
    pool.query(
        `INSERT INTO users (email,name) VALUES (?,?);`,
        [email, name],
        (err, results) => cb(err, err || results.insertId)
    );
};

export const setUpUser = (userId, cb) => {
    pool.query(
        `INSERT INTO types (user_id,name) VALUES (?,'Other');
        INSERT INTO accounts (user_id,name) VALUES (?,'Default');
        INSERT INTO settings VALUES
            (?,'strict.mode','true'),
            (?,'default.account',(SELECT id FROM accounts a where a.name='Default' AND a.user_id=?));`,
        Array(5).fill(userId),
        cb
    );
};

export const getControllees = (userId, cb) => {
    pool.query(
        `SELECT id, name FROM users WHERE id IN (SELECT controllee FROM usercontrol WHERE controller=?);`,
        [userId],
        cb
    );
};

export const isController = (controller, controllee, cb) => {
    pool.query(
        `SELECT EXISTS(SELECT 1 FROM usercontrol WHERE controller=? AND controllee=?);`,
        [controller, controllee],
        (err, results) => cb(err, results[0])
    );
};

export const getControllers = (userId, cb) => {
    pool.query(
        `SELECT email FROM users WHERE id IN (SELECT controller FROM usercontrol WHERE controllee=?)`,
        [userId],
        (err, results) => cb(err, err || results.map(r => r.email))
    );
};

export const addController = (userId, email, cb) => {
    pool.query(
        `INSERT INTO usercontrol (controller,controllee) VALUES ((SELECT id FROM users WHERE email=?),?);`,
        [email, userId],
        (err, results) => {
            if(err && err["sqlMessage"] == "Column 'controller' cannot be null") {
                cb();
            } else {
                cb(err, true);
            }
        }
    );
};

export const deleteController = (userId, email, cb) => {
    pool.query(
        `SELECT id FROM users WHERE email=?;`,
        [email],
        (err, results) => {
            let id;
            if (err) cb(err);
            else if (id = results[0].id) pool.query(
                `DELETE FROM usercontrol WHERE controller=? AND controllee=?;`,
                [id, userId],
                err => cb(err, id)
            );
            else cb();
        }
    );
};
