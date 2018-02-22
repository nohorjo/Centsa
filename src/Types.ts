import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    resp.send([{
        id: 1,
        name: "one third",
        sum: 1000
    }, {
        id: 2,
        name: "two thirds",
        sum: 2000
    }]);
});

route.post("/", (req, resp) => {
    const type = req.body;
    console.log(JSON.stringify(type));
    const id = Math.random();
    resp.send(id.toString());
});

route.delete('/:id', (req, resp) => {
    console.log(`deleting type ${req.params.id}`);
    resp.sendStatus(201);
})

const _route = Router();
_route.use('/types', route);

export default _route;