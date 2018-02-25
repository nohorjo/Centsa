import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    Connection.pool.query(
        'SELECT id,name,-(SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id) AS balance FROM accounts a WHERE user_id=?;',
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
    Connection.pool.query(
        'INSERT INTO accounts (name,user_id) VALUES (?,?);\
        SELECT LAST_INSERT_ID() AS id;',
        [req.body.name, req.session.userData.user_id],
        (err, results) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(results[1][0].id.toString());
            }
        }
    );
});

const _route = Router();
_route.use('/accounts', route);

export default _route;