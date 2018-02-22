import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    resp.send({
        "strict.mode": true,
        "trans.page.size": 15
    });
});

route.post("/", (req, resp) => {
    const setting = req.body;
    console.log(`Setting ${setting.key} to ${setting.value}`);
    resp.sendStatus(201);
})

const _route = Router();
_route.use('/settings', route);

export default _route;