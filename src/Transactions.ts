import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    console.log(JSON.stringify(req.query));

    resp.send([{
        id: 1,
        amount: -102,
        comment: "comment",
        account_id: 1,
        type_id: 1,
        date: 1512777600000,
        expense_id: 1
    }, {
        id: 2,
        amount: 982,
        comment: "comment2",
        account_id: 1,
        type_id: 2,
        date: 1499554800000,
        expense_id: 1
    }]);
});

route.post("/", (req, resp) => {
    const transaction = req.body;
    console.log(JSON.stringify(transaction));
    const id = Math.random();
    resp.send(id.toString());
});

route.delete('/:id', (req, resp) => {
    console.log(`deleting transaction ${req.params.id}`);
    resp.sendStatus(201);
})

route.get('/cumulativeSums', (req, resp) => {
    resp.send([
        {
            date: 1512777600000,
            sum: 10
        },
        {
            date: 1499554800000,
            sum: 20
        }
    ]);
});

route.get('/pages', (req, resp) => {
    resp.send((1).toString());
});

route.get('/summary', (req, resp) => {
    resp.send({
        count: 10,
        sum: 43245,
        min: -102,
        max: 982
    });
});

route.get('/comments', (req, resp) => {
    resp.send(["comment1", "comment2"]);
});

const _route = Router();
_route.use('/transactions', route);

export default _route;