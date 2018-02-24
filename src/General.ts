import { Router } from 'express';
import * as fs from 'fs';
import * as uuid from 'uuid/v4';

const route = Router();

route.get("/budget", (req, resp) => {
    resp.send({
        afterAll: 987,
        afterAuto: 654
    });
});

// =================== IMPORT
fs.mkdir('importProgress', err => {
    if (err && err.code != 'EEXIST') throw err;
});
route.get("/rules", (req, resp) => {
    resp.send([
        'default',
        'rule1',
        'rule2'
    ]);
});
route.get("/import", (req, resp) => {
    const path = `importProgress/${req.query.id}.json`;
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            resp.status(500).send(err);
        } else {
            const progress = JSON.parse(data);
            if (++progress.processed == progress.total) {
                fs.unlink(path, err => {
                    if (err) {
                        resp.status(500).send(err);
                    } else {
                        resp.send(null);
                    }
                });
            } else {
                fs.writeFile(path, JSON.stringify(progress), err => {
                    if (err) {
                        resp.status(500).send(err);
                    } else {
                        resp.send(progress);
                    }
                });
            }
        }
    });
});
route.post("/import", (req, resp) => {
    console.log(req.query.rule);
    if (!req['files']) {
        resp.status(400).send('No files were uploaded.');
    } else {
        const id = uuid();
        fs.writeFile(`importProgress/${id}.json`, JSON.stringify({
            processed: 0,
            total: 10
        }), err => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(id);
            }
        });
    }
});

const _route = Router();
_route.use('/general', route);

export default _route;
