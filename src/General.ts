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
        if (done = (++done % 10)) {
            resp.send({
                processed: done,
                total: 10
            });
        } else {
            resp.send(null);
        }
    }
})());
route.post("/import", (req, resp) => {
    console.log(req.query.rule);
    if (!req.files) {
        resp.status(400).send('No files were uploaded.');
    }
    else {
        resp.send(req.files.csv.data);
    }
});

const _route = Router();
_route.use('/general', route);

export default _route;
