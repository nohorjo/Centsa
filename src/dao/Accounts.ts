import { pool } from './Connection';

export const getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,-(COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id), 0)) AS balance FROM accounts a WHERE user_id=?;',
        [userId],
        cb
    );
};

export const insert = (account, cb) => {
    let { id, ...accountProperties } = account;
    pool.query(id ? "UPDATE accounts SET ? WHERE id=?;" : "INSERT INTO accounts SET ?;",
        [account, id],
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};