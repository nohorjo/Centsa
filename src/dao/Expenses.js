const { pool } = require('./Connection');

const Expenses = {};

Expenses.getAll = (userId, cb) => {
    pool.query(
        `SELECT id,name,cost,frequency,started,automatic,account_id,type_id, 
        (SELECT COUNT(*) FROM transactions t WHERE (t.expense_id IS NOT NULL AND t.expense_id=e.id) AND t.date>=e.started) AS instance_count 
        FROM expenses e WHERE user_id=?;`,
        [userId],
        cb,
    );
};

Expenses.getAllWithSum = (userId, cb) => {
    pool.query(
        `SELECT -SUM(amount) AS total FROM transactions WHERE user_id=? AND account_id IN (SELECT id FROM accounts WHERE user_id=? AND savings=FALSE);
        SELECT id,name,cost,frequency,started,automatic,account_id,type_id FROM expenses e WHERE user_id=?;`,
        Array(4).fill(userId),
        cb,
    );
};

Expenses.getTotals = (auto, date, userId, cb) => {
    const sql = auto ?
        'SELECT cost,frequency FROM expenses WHERE automatic=true AND started<? AND user_id=?;' :
        'SELECT cost,frequency FROM expenses WHERE started<=? AND user_id=?;';
    pool.query(sql, [date, userId], cb);
};

Expenses.checkEntityOwnership = (expense, cb) => {
    pool.query(
        `SELECT COUNT(*) AS count FROM users u 
    JOIN accounts a ON u.id=a.user_id 
    JOIN types t ON u.id=t.user_id 
    WHERE u.id!=? AND (a.id=? AND t.id=?);`,
        [
            expense.user_id,
            expense.account_id,
            expense.type_id
        ],
        (err, results) => {
            cb(err, err || !results[0].count);
        },
    );
};

Expenses.insert = (expense, cb) => {
    pool.query('INSERT INTO expenses SET ?;', expense, (err, results) => {
        cb(err, err || results.insertId);
    });
};

Expenses.deleteExpense = (id, userId, cb) => {
    pool.query(
        'DELETE FROM expenses WHERE id=? AND user_id=?;',
        [id, userId],
        cb,
    );
};

Expenses.getAutoExpenses = (all, id, untilDate, cb) => {
    pool.query(
        `SELECT id,user_id,name,cost,frequency,started,account_id,type_id 
            FROM expenses WHERE ${id ? `id=${parseInt(id)} AND` : ''} started<=? AND automatic=TRUE;`,
        [untilDate],
        cb,
    );
};

module.exports = Expenses;
