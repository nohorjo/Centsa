import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    Connection.pool.query(
        'SELECT id,name,cost,frequency,started,automatic,account_id,type_id,\
        (SELECT COUNT(*) FROM transactions t WHERE t.expense_id=e.id) AS instances_count \
        FROM expenses e WHERE user_id=?;',
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
    const expense = Object.assign({ user_id: req.session.userData.user_id }, req.body);
    Connection.pool.query(
        'INSERT INTO expenses SET ?;\
        SELECT LAST_INSERT_ID() AS id;', expense,
        (err, results) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(results[1][0].id.toString());
            }
        }
    );
});

route.delete('/:id', (req, resp) => {
    Connection.pool.query(
        "UPDATE transactions SET expense_id=\
        (SELECT id FROM expenses e WHERE e.user_id=? AND e.name='N/A') \
        WHERE expense_id=? AND user_id=?;\
        DELETE FROM expenses WHERE id=? AND user_id=?;",
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