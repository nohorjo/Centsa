import { Router } from 'express';

const route = Router();

route.get("/budget", (req, resp) => {
    resp.send({
        afterAll: 987,
        afterAuto: 654
    });
});

// =================== IMPORT
route.get("/rules", (req, resp) => {
    resp.send([
        'default',
        'rule1',
        'rule2'
    ]);
});

const _route = Router();
_route.use('/general', route);

export default _route;
