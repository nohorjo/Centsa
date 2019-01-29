const { pool } = require('./Connection');

const Users = {};

Users.getUserAETs = (emailOrId, cb) => {
    const getId = `SELECT ${isNaN(emailOrId) ? 'id FROM users WHERE email=?' : `${emailOrId} AS id`}`;
    pool.query(
        `${getId};
        SELECT id, name FROM accounts WHERE user_id=(${getId}) ORDER BY name;
        SELECT id, name, type_id FROM expenses WHERE user_id=(${getId}) ORDER BY name;
        SELECT id, name FROM types WHERE user_id=(${getId}) ORDER BY name;
        SELECT name FROM users WHERE id=(${getId})`, 
        Array(5).fill(emailOrId),
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
                    types: data[3],
                    name: data[4][0].name
                });
            }
        }
    );
};

Users.insert = (name, email, cb) => {
    pool.query(
        'INSERT INTO users (email,name) VALUES (?,?);',
        [email, name],
        (err, results) => cb(err, err || results.insertId)
    );
};

Users.setUpUser = (userId, cb) => {
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

Users.getControllees = (userId, cb) => {
    pool.query(
        'SELECT id, name FROM users WHERE id IN (SELECT controllee FROM usercontrol WHERE controller=?) ORDER BY name;',
        [userId],
        cb
    );
};

Users.isController = (controller, controllee, cb) => {
    pool.query(
        'SELECT EXISTS(SELECT 1 FROM usercontrol WHERE controller=? AND controllee=?);',
        [controller, controllee],
        (err, results) => cb(err, results[0])
    );
};

Users.getControllers = (userId, cb) => {
    pool.query(
        'SELECT email FROM users WHERE id IN (SELECT controller FROM usercontrol WHERE controllee=?) ORDER BY email;',
        [userId],
        (err, results) => cb(err, err || results.map(r => r.email))
    );
};

Users.addController = (userId, email, cb) => {
    pool.query(
        'INSERT INTO usercontrol (controller,controllee) VALUES ((SELECT id FROM users WHERE email=?),?);',
        [email, userId],
        err => {
            if(err && err.sqlMessage == 'Column "controller" cannot be null') {
                cb();
            } else {
                cb(err, true);
            }
        }
    );
};

Users.deleteController = (userId, email, cb) => {
    pool.query(
        'SELECT id FROM users WHERE email=?;',
        [email],
        (err, results) => {
            let id;
            if (err) cb(err);
            else if (results.length && (id = results[0].id)) pool.query(
                'DELETE FROM usercontrol WHERE controller=? AND controllee=?;',
                [id, userId],
                err => cb(err, id)
            );
            else cb();
        }
    );
};

Users.deleteUser = (userId, cb) => {
    pool.query(
        `DELETE FROM transactions WHERE user_id=?;
        DELETE FROM expenses WHERE user_id=?;
        DELETE FROM types WHERE user_id=?;
        DELETE FROM accounts WHERE user_id=?;
        DELETE FROM settings WHERE user_id=?;
        DELETE FROM rules WHERE user_id=?;
        DELETE FROM usercontrol WHERE controller=? OR controllee=?;
        DELETE FROM notifications WHERE user_id=?;
        DELETE FROM users WHERE id=?;`,
        Array(10).fill(userId),
        cb
    );
};

Users.updatePassword = (userId, password, cb) => {
    pool.query(
        `UPDATE users SET password=? WHERE id=? AND ${password.oldPassword ? 'password=?' : 'password IS NULL'};`,
        [
            password.newPassword,
            userId,
            password.oldPassword,
        ],
        (err, result) => cb(err, err || !!result.affectedRows)
    );
};

Users.getIdPassword = (email, cb) => {
    pool.query(
        'SELECT id, password FROM users WHERE email=?;',
        [email],
        cb
    );
};

module.exports = Users;
