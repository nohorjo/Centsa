import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    Connection.pool.query(
        'SELECT setting,value FROM settings WHERE user_id=?;',
        [req.session.userData.user_id],
        (err, results) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(results.reduce((a, b) => {
                    // Convert array of {key:x,value:y} to a single object {x:y}...
                    const x = {};
                    x[b.setting] = b.value;
                    return Object.assign(x, a);
                }, {}));
            }
        }
    );
});

route.post("/", (req, resp) => {
    const setting = req.body;
    Connection.pool.query(
        'REPLACE INTO settings (user_id, setting, value) VALUES (?,?,?);',
        [req.session.userData.user_id, setting.key, setting.setting],
        err => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.sendStatus(201);
            }
        });
});

const _route = Router();
_route.use('/settings', route);

export default _route;