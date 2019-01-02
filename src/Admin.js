const { Router } = require('express');
const log = require('./log');
const otplib = require('otplib');
const { exec } = require('child_process');
const { pool } = require('./dao/Connection');

log('init admin');

const route = Router();

const _route = Router();
_route.use('/admin', route);

route.post('/execute', (req, resp) => {
    try {
        const {
            token,
            command,
            mode
        } = req.body;
        if (otplib.authenticator.check(token, process.env.ADMIN_SECRET)) {
            log('executing', mode, command);
            switch (mode) {
            case 'sql':
                pool.query(command, (err, results) => {
                    resp.send(err || JSON.stringify(results, null, 4));
                });
                break;
            case 'sh':
                exec(command, (err, stdout, stderr) => {
                    resp.send(err || `STDOUT:\n\n${stdout}\n\nSTDERR:\n${stderr}`);
                });
                break;
            case 'javascript':
                eval(`new Promise((resolve, reject) => {${command}})`)
                    .then(result => resp.send(result))
                    .catch(error => resp.send(error));
                break;
            default:
                resp.status(400).send(`unsupported mode: ${mode}`);
            }
        } else {
            log.warn('unauthorized admin %s, %s', req.ip, command);
            resp.status(403).send((Date.now() / 1000 | 0).toString());
        }
    } catch (e) {
        log.error('execute error', e);
        resp.status(500).send(e);
    }
});

module.exports = _route;
