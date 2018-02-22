import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    resp.send([{
        id: 1,
        name: "test",
        cost: 123456,
        frequency:"1",
        started:1543795200000,
        automatic:true,
        account_id:1,
        type_id:1
    }]);
});

route.get('/total', (req, resp) => {
    resp.send(req.query.auto?"123":"456");
});

route.post("/", (req, resp) => {
    const expense = req.body;
    console.log(JSON.stringify(expense));
    const id = Math.random();
    resp.send(id.toString());
});

route.delete('/:id', (req, resp) => {
    console.log(`Deleting expense ${req.params.id}`);
    resp.sendStatus(201);
});



const _route = Router();
_route.use('/expenses', route);

export default _route;