const { Router } = require('express');
const dao = require('./dao/Types');
const log = require('./log');

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

route.post('/', (req, resp) => {
    log('insert type');
    const { name } = req.body;
    dao.insert(name, req.session.userData.user_id, (err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err.errno == 1062 ? 'A type with this name already exists' : err);
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
            resp.status(500).send(err.errno == 1451 ? "Cannot delete 'Other'" : err);
        } else if (!result.affectedRows) {
            resp.status(400).send("Cannot delete 'Other'");
        } else {
            req.session.userData.types = req.session.userData.types.filter(t => t.id != id);
            log('deleted type');
            resp.sendStatus(201);
        }
    });
});

const _route = Router();
_route.use('/types', route);

module.exports = _route;
