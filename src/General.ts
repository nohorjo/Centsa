import { Router } from 'express';
import { lastPaymentDate, nextPaymentDate } from './Expenses';
import { getAllWithSum } from './dao/Expenses';
import * as rules from './dao/Rules';

const route = Router();

route.get("/budget", (req, resp) => {
    getAllWithSum(req.session.userData.user_id, (err, results) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            const expenses = results[1];
            const strict = req.query.strict == "true";
            const currentDay = new Date(req.get('x-date')).valueOf();

            const budget = expenses.reduce(
                (currentBudget, expense) => {
                    if (expense.cost > 0 && expense.started < new Date(currentDay)) {
                        let cost = expense.cost;
                        if (!strict) {
                            const timeToNextPayment = nextPaymentDate(expense, currentDay) - currentDay;
                            const timeSinceLastPayment = currentDay - lastPaymentDate(expense, currentDay);

                            cost *= timeSinceLastPayment / (timeSinceLastPayment + timeToNextPayment);
                        }
                        currentBudget.afterAll -= cost;
                        if (expense.automatic) {
                            currentBudget.afterAuto -= cost;
                        }
                    }
                    return currentBudget;
                }, {
                    afterAll: results[0][0].total,
                    afterAuto: results[0][0].total
                }
            );
            resp.send(budget);
        }
    });
});

// =================== IMPORT
route.get("/rules", (req, resp) => {
    rules.getAll(req.session.userData.user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(result);
        }
    });
});

route.post("/rule/:name", (req, resp) => {
    const { name } = req.params;

    if (name && name != 'Default') {
        rules.insert(
            name,
            req.session.userData.user_id,
            req.body.script,
            (err, id) => {
                if (err) {
                    console.error(err);
                    resp.status(500).send(err);
                } else {
                    resp.send(id.toString());
                }
            }
        );
    } else {
        resp.status(400).send("Invalid name");
    }
});

route.get("/rule/:id", (req, resp) => {
    rules.getRule(req.params.id, req.session.userData.user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(result[0].content);
        }
    });
});

const _route = Router();
_route.use('/general', route);

export default _route;
