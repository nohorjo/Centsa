import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    resp.send([{
        id: 1,
        name: "test",
        balance: 123456
    }]);
});

route.post("/", (req, resp) => {
    const account = req.body;
    console.log(JSON.stringify(account));
    const id = Math.random();
    resp.send(id.toString());
});

const _route = Router();
_route.use('/accounts', route);

export default _route;