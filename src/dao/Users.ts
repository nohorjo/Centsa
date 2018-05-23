import { pool } from './Connection';

export const getId = (email, cb) => {
    pool.query('SELECT id FROM users WHERE email=?;', [email], (err, results) => {
        cb(err, err || (results[0] && results[0].id));
    });
};

export const insert = (name, email, cb) => {
    pool.query(
        `INSERT INTO users (email,name) VALUES (?,?);`,
        [email, name],
        (err, results) => cb(err, err || results.insertId);
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
        `SELECT id, name FROM users WHERE id IN (SELECT controllee FROM usercontrol WHERE user=?);`,
        [userId],
        cb
    );
};

export const isController = (controller, controllee, cb) => {
    pool.query(
        `SELECT EXISTS(SELECT 1 FROM usercontrol WHERE controller=? AND controllee=?);`,
        [controller, controllee],
        (err, result) => cb(err, results[0])
    );
};
