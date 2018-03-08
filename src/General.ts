import { Router } from 'express';
import Connection from './Connection';
import { lastPaymentDate, nextPaymentDate } from './Expenses';

const route = Router();

route.get("/budget", (req, resp) => {
    Connection.pool.query(
        `SELECT -SUM(amount) AS total FROM transactions WHERE user_id=?;
        SELECT id,name,cost,frequency,started,automatic,account_id,type_id FROM expenses e WHERE user_id=?;`,
        [req.session.userData.user_id, req.session.userData.user_id],
        (err, results) => {
            if (err) {
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
        }
    );

});

// =================== IMPORT
route.get("/rules", (req, resp) => {
    Connection.pool.query(
        "SELECT id,name FROM rules WHERE user_id IS NULL OR user_id=?;",
        [req.session.userData.user_id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result);
            }
        }
    );
});

route.get("/rule/:id", (req, resp) => {
    Connection.pool.query(
        "SELECT content FROM rules WHERE (user_id IS NULL OR user_id=?) AND id=?;",
        [req.session.userData.user_id, req.params.id],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.send(result[0].content);
            }
        }
    );
});

const _route = Router();
_route.use('/general', route);

export default _route;
