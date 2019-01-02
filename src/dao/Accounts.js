const { pool } = require('./Connection');

const Accounts = {};

Accounts.getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,-(COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id), 0)) AS balance FROM accounts a WHERE user_id=?;',
        [userId],
        cb
    );
};

Accounts.insert = (account, cb) => {
    let { id } = account;
    pool.query(id ? 'UPDATE accounts SET ? WHERE id=?;' : 'INSERT INTO accounts SET ?;',
        [account, id],
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};

module.exports = Accounts;
