import { Router } from 'express';
import { pool } from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    pool.query(
        'SELECT id,name,(SELECT SUM(amount) FROM transactions t WHERE t.type_id=a.id) AS sum FROM types a WHERE user_id=?;',
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
    pool.query(
        'INSERT INTO types (name,user_id) VALUES (?,?);',
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
});

route.delete('/:id', (req, resp) => {
    pool.query(
        `UPDATE transactions tr SET type_id=
        (SELECT id FROM types ty WHERE ty.user_id=? AND ty.name='Other')
        WHERE type_id=? AND user_id=?;
        UPDATE expenses SET type_id=
        (SELECT id FROM types ty WHERE ty.user_id=? AND ty.name='Other')
        WHERE type_id=? AND user_id=?;
        DELETE FROM types WHERE id=? AND user_id=?;`,
        [
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else {
                resp.sendStatus(201);
            }
        }
    );
});

const _route = Router();
_route.use('/types', route);

export default _route;