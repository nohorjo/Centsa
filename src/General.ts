import { Router } from 'express';

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
    let done = 0;
    return (req, resp) => {
        if (done++ % 10) {
            resp.send({
                processed: done,
                total: 10
            });
        } else {
            resp.sendStatus(201);
        }
    }
})());
route.post("/import", (req, resp) => {
    //FIXME: accept file
});

const _route = Router();
_route.use('/general', route);

export default _route;