import { Router } from 'express';
import * as dao from './dao/Types';

const route = Router();

route.get('/', (req, resp) => {
    dao.getAll(req.session.userData.user_id,(err, result) => {
        if (err) {
            resp.status(500).send(err);
        } else {
            resp.send(result);
        }
    });
});

route.post("/", (req, resp) => {
    dao.insert(req.body.name, req.session.userData.user_id,(err, id) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(id.toString());
        }
    });
});

route.delete('/:id', (req, resp) => {
    dao.deleteType(req.params.id,req.session.userData.user_id,(err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.sendStatus(201);
        }
    });
});

const _route = Router();
_route.use('/types', route);

export default _route;