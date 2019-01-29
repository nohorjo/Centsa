const { pool } = require('./Connection');

const Accounts = {};

Accounts.getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,savings, -(COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id), 0)) AS balance FROM accounts a WHERE user_id=? ORDER BY name;',
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
    if (idToTransfer == -1) {
        pool.query(
            `DELETE FROM transactions WHERE account_id=? AND user_id=?;
            DELETE FROM expenses WHERE account_id=(SELECT id FROM accounts WHERE id=? AND savings=FALSE) AND user_id=?;
            DELETE FROM accounts WHERE id=? AND user_id=?;`,
            [].concat(...Array(3).fill([idToDelete, userId])),
            cb,
        );
    } else {
        pool.query(
            `UPDATE transactions SET account_id=(SELECT id FROM accounts WHERE id=? AND user_id=?) WHERE account_id=? AND user_id=?;
            UPDATE expenses SET account_id=(SELECT id FROM accounts WHERE id=? AND user_id=?) WHERE account_id=? AND user_id=?;
            DELETE FROM accounts WHERE id=? AND user_id=?;`,
            [
                idToTransfer,
                userId,
                idToDelete,
                userId,
                idToTransfer,
                userId,
                idToDelete,
                userId,
                idToDelete,
                userId,
            ],
            cb,
        );
    }
};

module.exports = Accounts;
