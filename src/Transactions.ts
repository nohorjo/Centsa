import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    //FIXME: filter
    const filter = JSON.parse(req.query.filter);
    //{account_id:0,type_id:0,expense_id:0,regex:false}
    const { page, pageSize, sort } = req.query;

    Connection.pool.query(
        'SELECT id,amount,comment,account_id,type_id,date,expense_id FROM transactions WHERE user_id=?;',
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

route.post("/", (req, resp) => {
    const transaction = Object.assign({ user_id: req.session.userData.user_id }, req.body);
    transaction.date = new Date(transaction.date);
    Connection.pool.query(
        //FIXME: account, expense and type IDs need to be checked that they belong to the user
        'INSERT INTO transactions SET ?;\
        SELECT LAST_INSERT_ID() AS id;', transaction,
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
})

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
    //FIXME: filter
    const filter = JSON.parse(req.query.filter);
    //{account_id:0,type_id:0,expense_id:0,regex:false}
    const { page, pageSize, sort } = req.query;

    Connection.pool.query(
        'SELECT COUNT(*) AS count, SUM(amount) AS sum, MIN(amount) as min, MAX(amount) AS max FROM transactions WHERE user_id=?;',
        [req.session.userData.user_id],
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
    Connection.pool.query(
        'SELECT COUNT(*) as count FROM transactions WHERE user_id=? AND account_id=? AND type_id=? AND expense_id=?;',
        [//FIXME:
            req.session.userData.user_id,
            filter.account_id,
            filter.type_id,
            filter.expense_id
        ],
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