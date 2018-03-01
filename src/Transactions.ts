import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    const filter = JSON.parse(req.query.filter);
    filter.account_id = parseInt(filter.account_id);
    filter.type_id = parseInt(filter.type_id);
    filter.expense_id = parseInt(filter.expense_id);
    if (!filter.regex) {
        filter.comment = `%${filter.comment}%`;
    }

    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    if (sort && !/^(\s*[a-z]* (asc|desc),?)+$/.test(sort)) {
        sort = '1 ASC';
    }

    Connection.pool.query(
        `SELECT id,amount,comment,account_id,type_id,date,expense_id FROM transactions WHERE user_id=?
        ${filter.account_id ? ` AND account_id=${filter.account_id}` : ''} 
        ${filter.type_id ? ` AND type_id=${filter.type_id}` : ''} 
        ${filter.expense_id ? ` AND expense_id=${filter.expense_id}` : ''}
        AND comment ${filter.regex ? 'R' : ''}LIKE ?
        ${sort.replace(/,$/g, "")}
        LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)};`,
        [req.session.userData.user_id, filter.comment],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result);
            }
        }
    );
});

route.post("/", (req, resp) => {
    const transaction = req.body;
    transaction.user_id = req.session.userData.user_id;
    transaction.date = new Date(transaction.date);
    Connection.pool.query(
        `SELECT COUNT(*) AS count FROM users u 
        JOIN accounts a ON u.id=a.user_id 
        JOIN expenses e ON u.id=e.user_id 
        JOIN types t ON u.id=t.user_id 
        WHERE u.id=? AND a.id=? AND e.id=? AND t.id;`,
        [
            transaction.user_id,
            transaction.account_id,
            transaction.expense_id,
            transaction.type_id
        ],
        (err, results) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                if (results[0].count) {
                    Connection.pool.query(
                        `INSERT INTO transactions SET ?;
                        SELECT LAST_INSERT_ID() AS id;`, transaction,
                        (err, results) => {
                            if (err) {
                                resp.status(500).send(err);
                            } else {
                                resp.send(results[1][0].id.toString());
                            }
                        }
                    );
                } else {
                    resp.status(400).send("Invalid account, expense or type id");
                }
            }
        }
    );
});

route.delete('/:id', (req, resp) => {
    Connection.pool.query(
        'DELETE FROM transactions WHERE id=? AND user_id=?;',
        [req.params.id, req.session.userData.user_id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.sendStatus(201);
            }
        }
    );
});

route.get('/cumulativeSums', (req, resp) => {
    Connection.pool.query(
        'SELECT date,amount FROM transactions WHERE user_id=? ORDER BY date ASC;',
        [req.session.userData.user_id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                let currentSum = 0;
                resp.send(result.map(e => ({
                    date: e.date,
                    sum: currentSum += e.amount
                })));
            }
        });
});

route.get('/summary', (req, resp) => {
    const filter = JSON.parse(req.query.filter);
    filter.account_id = parseInt(filter.account_id);
    filter.type_id = parseInt(filter.type_id);
    filter.expense_id = parseInt(filter.expense_id);
    if (!filter.regex) {
        filter.comment = `%${filter.comment}%`;
    }
    Connection.pool.query(
        `SELECT COUNT(*) AS count, SUM(amount) AS sum, MIN(amount) as min, MAX(amount) AS max FROM transactions WHERE user_id=?
        ${filter.account_id ? ` AND account_id=${filter.account_id}` : ''} 
        ${filter.type_id ? ` AND type_id=${filter.type_id}` : ''} 
        ${filter.expense_id ? ` AND expense_id=${filter.expense_id}` : ''}
        AND comment ${filter.regex ? 'R' : ''}LIKE ?;`,
        [req.session.userData.user_id, filter.comment],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result[0]);
            }
        });
});

route.get('/comments', (req, resp) => {
    Connection.pool.query(
        'SELECT DISTINCT comment FROM transactions WHERE user_id=?;',
        [req.session.userData.user_id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result.map(x => x.comment));
            }
        });
});

route.get('/countPages', (req, resp) => {
    const filter = JSON.parse(req.query.filter);
    filter.account_id = parseInt(filter.account_id);
    filter.type_id = parseInt(filter.type_id);
    filter.expense_id = parseInt(filter.expense_id);
    if (!filter.regex) {
        filter.comment = `%${filter.comment}%`;
    }
    Connection.pool.query(
        `SELECT COUNT(*) as count FROM transactions WHERE user_id=?
        ${filter.account_id ? ` AND account_id=${filter.account_id}` : ''} 
        ${filter.type_id ? ` AND type_id=${filter.type_id}` : ''} 
        ${filter.expense_id ? ` AND expense_id=${filter.expense_id}` : ''}
        AND comment ${filter.regex ? 'R' : ''}LIKE ?;`,
        [req.session.userData.user_id, filter.comment],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                console.dir(result[0]);
                resp.send((Math.floor(result[0].count / req.query.pageSize) + 1).toString());
            }
        });
});

const _route = Router();
_route.use('/transactions', route);

export default _route;