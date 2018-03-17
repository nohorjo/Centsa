import { Router } from 'express';
import { pool } from './Connection';

export const getAll = (req, resp) => {
    pool.query(
        'SELECT id,name,-(SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id) AS balance FROM accounts a WHERE user_id=?;',
        [req.session.userData.user_id],
        (err, result) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else {
                resp.send(result);
            }
        }
    );
};

export const insert = (req, resp) => {
    pool.query(
        `INSERT INTO accounts (name,user_id) VALUES (?,?);`,
        [req.body.name, req.session.userData.user_id],
        (err, results) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else {
                resp.send(results.insertId.toString());
            }
        }
    );
};

const route = Router();

route.get('/', getAll);
route.post("/", insert);

const _route = Router();
_route.use('/accounts', route);

export default _route;
