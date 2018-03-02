import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get("/budget", (req, resp) => {
    resp.send({
        afterAll: 987,
        afterAuto: 654
    });
});

route.get("/rules", (req, resp) => {
    Connection.pool.query(
        "SELECT name FROM rules WHERE user_id IS NULL OR user_id=?;",
        [req.session.userData.user_id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result.map(x => x.name));
            }
        }
    );
});

const _route = Router();
_route.use('/general', route);

export default _route;
