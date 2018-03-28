import { Router } from 'express';
import * as dao from './dao/Settings';

const route = Router();

route.get('/', (req, resp) => {
    dao.getAll(req.session.userData.user_id, (err, results) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(results);
        }
    });
});

route.post("/", (req, resp) => {
    const setting = req.body;
    dao.setSetting(req.body, req.session.userData.user_id, err => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.sendStatus(201);
        }
    });
});

const _route = Router();
_route.use('/settings', route);

export default _route;