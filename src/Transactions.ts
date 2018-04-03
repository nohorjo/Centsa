import { Router } from 'express';
import * as dao from './dao/Transactions';

const route = Router();

route.get('/', (req, resp) => {
    const filter = parseFilter(req);

    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;

    dao.getAll(
        req.session.userData.user_id,
        filter,
        page,
        pageSize,
        sort,
        (err, result) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else {
                result.forEach(t => t.date.setHours(12));
                resp.send(result);
            }
        }
    );
});

route.post("/", (() => {
    const insertBatch = (req, resp) => {
        const transactions = [];
        let accountIds = [];
        let expenseIds = [-1];
        let typeIds = [];
        req.body.forEach(t => {
            transactions.push([
                req.session.userData.user_id,
                t.amount,
                t.comment,
                t.account_id,
                t.type_id,
                t.expense_id || null,
                new Date(t.date)
            ]);
            if (!accountIds.includes(t.account_id)) {
                accountIds.push(t.account_id);
            }
            if (t.expense_id && !expenseIds.includes(t.expense_id)) {
                expenseIds.push(t.expense_id);
            }
            if (!typeIds.includes(t.type_id)) {
                typeIds.push(t.type_id);
            }
        });
        dao.checkBatchEntityOwnership(
            req.session.userData.user_id,
            accountIds,
            expenseIds,
            typeIds,
            (err, allowed) => {
                if (err) {
                    console.error(err);
                    resp.status(500).send(err);
                } else {
                    if (!allowed) {
                        resp.status(400).send("Invalid account, expense or type ids");
                    } else {
                        dao.insertBatch(transactions, (err, results) => {
                            if (err) {
                                console.error(err);
                                resp.status(500).send(err);
                            } else {
                                resp.sendStatus(201);
                            }
                        });
                    }
                }
            }
        );
    };

    const insert = (req, resp) => {
        const transaction = req.body;
        transaction.user_id = req.session.userData.user_id;
        transaction.date = new Date(transaction.date);
        if (!transaction.expense_id) {
            delete transaction.expense_id;
        }
        dao.checkEntityOwnership(transaction, (err, allowed) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else {
                if (!allowed) {
                    resp.status(400).send("Invalid account, expense or type id");
                } else {
                    dao.insert(transaction, (err, id) => {
                        if (err) {
                            console.error(err);
                            resp.status(500).send(err);
                        } else {
                            resp.send(id.toString());
                        }
                    });
                }
            }
        });
    };
    return (req, resp) => {
        if (req.body instanceof Array) {
            insertBatch(req, resp);
        } else {
            insert(req, resp);
        }
    };
})());

route.delete('/:id', (req, resp) => {
    dao.deleteTransaction(req.params.id, req.session.userData.user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.sendStatus(201);
        }
    });
});

route.get('/cumulativeSums', (req, resp) => {
    dao.getAmounts(req.session.userData.user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            let currentSum = 0;
            resp.send(result.reduce((arr, e) => {
                const other = arr.find(x => x.date.valueOf() == e.date.valueOf());
                if (other) {
                    other.amount += e.amount;
                } else {
                    arr.push(e);
                }
                return arr;
            }, []).map(e => ({
                date: e.date,
                sum: currentSum += e.amount
            })));
        }
    });
});

route.get('/summary', (req, resp) => {
    const filter = parseFilter(req);
    dao.getSummary(req.session.userData.user_id, filter, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(result[0]);
        }
    });
});

route.get('/comments', (req, resp) => {
    dao.getUniqueComments(req.session.userData.user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(result.map(x => x.comment));
        }
    });
});

const _route = Router();
_route.use('/transactions', route);

export default _route;

const parseFilter = req => {
    const filter = JSON.parse(req.query.filter);
    filter.account_id = parseInt(filter.account_id);
    filter.type_id = parseInt(filter.type_id);
    filter.expense_id = parseInt(filter.expense_id);
    if (!filter.comment) {
        filter.comment = "";
        filter.regex = false;
    }
    if (!filter.regex) {
        filter.comment = `%${filter.comment}%`;
    }
    filter.fromDate = new Date(filter.fromDate || 0);
    filter.toDate = new Date(filter.toDate || req.get('x-date'));
    filter.fromAmount = parseInt(filter.fromAmount == null ? Number.MIN_SAFE_INTEGER : filter.fromAmount);
    filter.toAmount = parseInt(filter.toAmount == null ? Number.MAX_SAFE_INTEGER : filter.toAmount);

    return filter;
};