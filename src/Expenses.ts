import { Router } from 'express';
import Connection from './Connection';

const route = Router();

route.get('/', (req, resp) => {
    Connection.pool.query(
        `SELECT id,name,cost,frequency,started,automatic,account_id,type_id, 
        (SELECT COUNT(*) FROM transactions t WHERE t.expense_id=e.id) AS instances_count 
        FROM expenses e WHERE user_id=?;`,
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

route.get('/total', (req, resp) => {
    const sql = req.query.auto == "true" ?
        "SELECT SUM(COST/FREQUENCY) FROM expenses WHERE AUTOMATIC = 1 AND STARTED < CURRENT_DATE();" :
        "SELECT SUM(COST/FREQUENCY) FROM expenses WHERE STARTED < CURRENT_DATE();";
    Connection.pool.query(sql, [], (err, result) => {
        if (err) {
            resp.status(500).send(err);
        } else {
            resp.send(result);
        }
    });
});

route.post("/", (req, resp) => {
    const expense = req.body;
    if (isFrequencyValid(expense.frequency)) {
        expense.user_id = req.session.userData.user_id;
        expense.started = new Date(expense.started);
        Connection.pool.query(
            `SELECT COUNT(*) AS count FROM users u 
        JOIN accounts a ON u.id=a.user_id 
        JOIN types t ON u.id=t.user_id 
        WHERE u.id!=? AND (a.id=? AND t.id=?);`,
            [
                expense.user_id,
                expense.account_id,
                expense.type_id,
            ],
            (err, results) => {
                if (err) {
                    resp.status(500).send(err);
                } else {
                    if (results[0].count) {
                        resp.status(400).send("Invalid account or type id");
                    } else {
                        Connection.pool.query(
                            `INSERT INTO expenses SET ?;`,
                            expense,
                            (err, results) => {
                                if (err) {
                                    resp.status(500).send(err);
                                } else {
                                    if (expense.automatic) {
                                        applyAutoTransactions(true, results.insertId);
                                    }
                                    resp.send(results.insertId.toString());
                                }
                            }
                        );
                    }
                }
            }
        );
    } else {
        resp.status(400).send("Invalid frequency");
    }
});

route.delete('/:id', (req, resp) => {
    Connection.pool.query(
        `UPDATE transactions SET expense_id=
        (SELECT id FROM expenses e WHERE e.user_id=? AND e.name='N/A')
        WHERE expense_id=? AND user_id=?;
        DELETE FROM expenses WHERE id=? AND user_id=?;`,
        [
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
            req.params.id,
            req.session.userData.user_id,
        ],
        (err, result) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.sendStatus(201);
            }
        }
    );
});

const _route = Router();
_route.use('/expenses', route);

export default _route;

export const lastPaymentDate = (expense, date) => {
    date = new Date(date);
    while (
        !isDayOfPayment(expense.frequency, date, expense.started)
        && date > expense.started
    ) {
        date.setDate(date.getDate() - 1);
    }
    return date;
};

export const nextPaymentDate = (expense, date) => {
    if (date < expense.started) {
        date = new Date(expense.started);
    } else {
        date = new Date(date);
        date.setDate(date.getDate() + 1);
    }
    while (!isDayOfPayment(expense.frequency, date, expense.started)) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

export const applyAutoTransactions = (all?, id?) => {
    const today = new Date();
    Connection.pool.query(
        `SELECT id,user_id,name,cost,frequency,started,account_id,type_id 
            FROM expenses WHERE ${id ? `id=${parseInt(id)} AND` : ""} started>=? AND automatic=TRUE;`,
        [today],
        (err, result) => {
            if (err) throw err;
            if (!all) {
                result = result.filter(e => isDayOfPayment(e.frequency, today, e.started));
            }
            const expectedTransactions = result.map(e => ({
                amount: e.cost,
                comment: e.name,
                account_id: e.account_id,
                type_id: e.type_id,
                expense_id: e.id,
                date: today
            }));

            //TODO: insert expected auto transactions if not already inserted
        }
    );
};

const isDayOfPayment = (() => {
    const checkPotentialDays = (d, accept, date) => {
        const xDays = [];
        const temp = new Date(date);
        const month = temp.getMonth();
        if (d > 0) {
            temp.setDate(1);
            while (temp.getMonth() == month) {
                if (accept(temp)) {
                    xDays.push(new Date(temp));
                }
                temp.setDate(temp.getDate() + 1);
            }
            if (d >= xDays.length) {
                return date.getDate() == xDays.pop().getDate();
            } else {
                return date.getDate() == xDays[d - 1].getDate();
            }
        } else {
            temp.setMonth(temp.getMonth() + 1);
            temp.setDate(0);
            while (temp.getMonth() == month) {
                if (accept(temp)) {
                    xDays.push(new Date(temp));
                }
                temp.setDate(temp.getDate() - 1);
            }
            if (-d >= xDays.length) {
                return date.getDate() == xDays.pop().getDate();
            } else {
                return date.getDate() == xDays[d - 1].getDate();
            }
        }
    };
    return (frequency, date, started) => {
        frequency = frequency.toString().toUpperCase();
        if (date < started) {
            return false;
        } else if (/^\d+$/g.test(frequency)) {
            return Math.floor((date - started) / 8.64e7 % frequency) == 0;
        } else if (/^DATE \d+$/g.test(frequency)) {
            return frequency.substring(5) == date.getDate();
        } else if (/^DATE \d+\/\d+$/g.test(frequency)) {
            const dm = frequency.substring(5).split("/");
            return dm[0] == date.getDate() && dm[1] - 1 == date.getMonth();
        } else if (/^DAY -?\d+$/g.test(frequency)) {
            const d = frequency.substring(4);
            return checkPotentialDays(d, () => true, date);
        } else if (/^DAY (MO|TU|WE|TH|FR|SA|SU) -?\d+$/g.test(frequency)) {
            const d = frequency.substring(7);
            const day = "SUMOTUWETHFRSA".indexOf(frequency.substring(4, 6)) / 2;
            return checkPotentialDays(d, temp => temp.getDay() == day, date);
        } else if (/^WDAY -?\d+$/g.test(frequency)) {
            const d = frequency.substring(5);
            return checkPotentialDays(d, temp => temp.getDay() != 0 && temp.getDay() != 6, date);
        } else if (/^RDAY -?\d+$/g.test(frequency)) {
            const d = frequency.substring(5);
            return checkPotentialDays(d, temp => temp.getDay() == 0 || temp.getDay() == 6, date);
        }
    };
})();

/**
 * Validates the frequency
 * Valid formats are:
 * 
 * [Days per occurrence]
 * DATE [date in month]
 * DATE [date in year (d/m)]
 * DAY [Nth day of the month (negative for last Nth day)]
 * DAY [day of week (first 2 chars)] [Nth occurrence in the month (negative for last Nth occurrence)]
 * WDAY [Nth work-day in month (negative for last Nth day)]
 * RDAY [Nth rest-day in month (negative for last Nth day)]
 *
 * @param frequency The frequency to check
 */
const isFrequencyValid = frequency => {
    frequency = frequency.toString().toUpperCase();
    if (/^\d+$/g.test(frequency)) {
        return frequency > 0;
    } else if (/^DATE \d+$/g.test(frequency)) {
        const d = frequency.substring(5);
        return d >= 1 && d <= 31;
    } else if (/^DATE \d+\/\d+$/g.test(frequency)) {
        const dm = frequency.substring(5).split("/");
        const d = dm[0];
        const m = dm[1];

        if (m >= 1 && m <= 12 && d >= 1) {
            switch (m) {
                case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                    return d <= 31;
                case 4: case 6: case 9: case 11:
                    return d <= 30;
                case 2:
                    return d <= 29;
            }
        }
    } else if (/^DAY -?\d+$/g.test(frequency)) {
        const d = frequency.substring(4);
        return d < 31 && d >= -31 && d != 0;
    } else if (/^DAY (MO|TU|WE|TH|FR|SA|SU) -?\d+$/g.test(frequency)) {
        const d = frequency.substring(7);
        return d < 5 && d >= -5 && d != 0;
    } else if (/^WDAY -?\d+$/g.test(frequency)) {
        const d = frequency.substring(5);
        return d < 23 && d >= -23 && d != 0;
    } else if (/^RDAY -?\d+$/g.test(frequency)) {
        const d = frequency.substring(5);
        return d < 12 && d >= -12 && d != 0;
    }
};