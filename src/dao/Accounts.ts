import { pool } from './Connection';

export const getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,-(SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id) AS balance FROM accounts a WHERE user_id=?;',
        [userId],
        cb
    );
};

export const insert = (name, userId, cb) => {
    pool.query(
        `INSERT INTO accounts (name,user_id) VALUES (?,?);`,
        [name, userId],
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};