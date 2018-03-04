import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    Connection.pool.query(
        `SELECT id,name,cost,frequency,started,automatic,account_id,type_id, 
        (SELECT COUNT(*) FROM transactions t WHERE t.expense_id=e.id) AS instances_count 
        FROM expenses e WHERE user_id=?;`,
        [req.session.userData.user_id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result);
            }
        }
    );
});

route.get('/total', (req, resp) => {
    const sql = req.query.auto == "true" ?
        "SELECT SUM(COST/FREQUENCY) FROM expenses WHERE AUTOMATIC = 1 AND STARTED < CURRENT_DATE();" :
        "SELECT SUM(COST/FREQUENCY) FROM expenses WHERE STARTED < CURRENT_DATE();";
    Connection.pool.query(sql, [], (err, result) => {
        if (err) {
            resp.status(500).send(err);
        } else {
            resp.send(result);
        }
    });
});

route.post("/", (req, resp) => {
    const expense = req.body;
    expense.user_id = req.session.userData.user_id;
    expense.started = new Date(expense.started);
    Connection.pool.query(
        `SELECT COUNT(*) AS count FROM users u 
        JOIN accounts a ON u.id=a.user_id 
        JOIN types t ON u.id=t.user_id 
        WHERE u.id!=? AND (a.id=? AND t.id=?);`,
        [
            expense.user_id,
            expense.account_id,
            expense.type_id,
        ],
        (err, results) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                if (results[0].count) {
                    resp.status(400).send("Invalid account or type id");
                } else {
                    Connection.pool.query(
                        `INSERT INTO expenses SET ?;`,
                        expense,
                        (err, results) => {
                            if (err) {
                                resp.status(500).send(err);
                            } else {
                                resp.send(results.insertId.toString());
                            }
                        }
                    );
                }
            }
        });
});

route.delete('/:id', (req, resp) => {
    Connection.pool.query(
        `UPDATE transactions SET expense_id=
        (SELECT id FROM expenses e WHERE e.user_id=? AND e.name='N/A')
        WHERE expense_id=? AND user_id=?;
        DELETE FROM expenses WHERE id=? AND user_id=?;`,
        [
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
        ],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.sendStatus(201);
            }
        }
    );
});

const _route = Router();
_route.use('/expenses', route);

export default _route;

export const lastPaymentDate = (expense, date) => { return new Date(); };
export const nextPaymentDate = (expense, date) => { return new Date(); };