import { Router } from 'express';
import * as dao from './dao/Types';
import log from './log';

log('init types');

const route = Router();

route.get('/', (req, resp) => {
    log('get all types');
    if (req.query.light == 'true') {
        log('returning types from cache');
        resp.send(req.session.userData.types);
    } else {
        dao.getAll(req.session.userData.user_id, (err, result) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else {
                req.session.userData.types = result;
                log('returning types');
                resp.send(result);
            }
        });
    }
});

route.post("/", (req, resp) => {
    log('insert type');
    const { name } = req.body;
    dao.insert(name, req.session.userData.user_id, (err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            req.session.userData.types.push({name, id});
            log('inserted type');
            resp.send(id.toString());
        }
    });
});

route.delete('/:id', (req, resp) => {
    log('deleting type');
    const { id } = req.params;
    dao.deleteType(id, req.session.userData.user_id, (err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            req.session.userData.types = req.session.userData.types.filter(t => t.id != id);
            log('deleted type');
            resp.sendStatus(201);
        }
    });
});

const _route = Router();
_route.use('/types', route);

export default _route;
