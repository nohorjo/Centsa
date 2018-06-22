import { Router } from 'express';
import * as dao from './dao/Types';
import log from './log';

log('init types');

const route = Router();

route.get('/', (req, resp) => {
    log('get all types');
    dao.getAll(req.session.userData.user_id,(err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning types');
            resp.send(result);
        }
    });
});

route.post("/", (req, resp) => {
    log('insert type');
    dao.insert(req.body.name, req.session.userData.user_id,(err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('inserted type');
            resp.send(id.toString());
        }
    });
});

route.delete('/:id', (req, resp) => {
    log('deleting type');
    dao.deleteType(req.params.id,req.session.userData.user_id,(err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('deleted type');
            resp.sendStatus(201);
        }
    });
});

const _route = Router();
_route.use('/types', route);

export default _route;
