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
        date: new Date(2015,2,5),
        expense_id: 1
    }, {
        id: 2,
        amount: 982,
        comment: "comment2",
        account_id: 1,
        type_id: 2,
        date: new Date(2014, 3, 11),
        expense_id: 1
    }]);
});

route.post("/", (req, resp) => {
    const transaction = req.body;
    transaction.date = new Date(transaction.date);
    console.dir(transaction);
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
            date: new Date(2013, 3, 9),
            sum: 10
        },
        {
            date: new Date(2011, 0, 30),
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