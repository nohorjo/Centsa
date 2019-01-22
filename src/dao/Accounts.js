const { pool } = require('./Connection');

const Accounts = {};

Accounts.getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,savings, -(COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id), 0)) AS balance FROM accounts a WHERE user_id=?;',
        [userId],
        (err, result) => {
            if (err) {
                cb(err);
            } else {
                result.forEach(a => {
                    a.balance = a.balance || 0;
                    a.savings = !!a.savings;
                });
                cb(null, result);
            }
        },
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

Accounts.deleteAccount = (userId, idToDelete, idToTransfer, cb) => {
    // TODO implement
};

module.exports = Accounts;
