const { Router } = require('express');
const dao = require('./dao/Settings');
const log = require('./log');

log('init settings');

const route = Router();

route.get('/', (req, resp) => {
    log('get settings');
    dao.getAll(req.session.userData.user_id, (err, results) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning settings');
            resp.send(results);
        }
    });
});

route.post("/", (req, resp) => {
    log('set setting');
    const setting = req.body;
    dao.setSetting(req.body, req.session.userData.user_id, err => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('setting set');
            resp.sendStatus(201);
        }
    });
});

const _route = Router();
_route.use('/settings', route);

module.exports = _route;
