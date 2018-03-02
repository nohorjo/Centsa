import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get("/budget", (req, resp) => {
    resp.send({
        afterAll: 987,
        afterAuto: 654
    });
});

// =================== IMPORT
route.get("/rules", (req, resp) => {
    Connection.pool.query(
        "SELECT id,name FROM rules WHERE user_id IS NULL OR user_id=?;",
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

route.get("/rule/:id", (req, resp) => {
    Connection.pool.query(
        "SELECT content FROM rules WHERE (user_id IS NULL OR user_id=?) AND id=?;",
        [req.session.userData.user_id, req.params.id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result[0].content);
            }
        }
    );
});

const _route = Router();
_route.use('/general', route);

export default _route;
