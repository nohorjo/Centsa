import { pool } from './Connection';

export const getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,-(SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id) AS balance FROM accounts a WHERE user_id=?;',
        [userId],
        cb
    );
};

export const insert = (account, cb) => {
    pool.query(
        `${account.id ? 'REPLACE' : 'INSERT'} INTO accounts SET ?;`,
        account,
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};