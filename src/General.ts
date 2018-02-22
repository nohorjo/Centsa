import { Router } from 'express';
import cache from './clonedCache';

const route = Router();

route.get("/budget", (req, resp) => {
    resp.send({
        afterAll: 987,
        afterAuto: 654
    });
});
route.get("/rules", (req, resp) => {
    resp.send(['rule1', 'rule2']);
});
route.get("/import", (() => {
    cache.data = 0;
    return (req, resp) => {
        if (cache.data = (++cache.data % 10)) {
            resp.send({
                processed: cache.data,
                total: 10
            });
        } else {
            resp.send(null);
        }
    }
})());
route.post("/import", (req, resp) => {
    console.log(req.query.rule);
    if (!req['files']) {
        resp.status(400).send('No files were uploaded.');
    }
    else {
        resp.send(req['files'].csv.data);
    }
});

const _route = Router();
_route.use('/general', route);

export default _route;
