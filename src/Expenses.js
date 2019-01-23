const { Router } = require('express');
const dao = require('./dao/Expenses');
const tdao = require('./dao/Transactions');
const log = require('./log');

log('init expense');

const _route = Router();

_route.getAll = (req, resp) => {
    log('get all expenses');
    if (req.query.light == 'true') {
        log('returning expenses from cache');
        resp.send(req.session.userData.expenses);
    } else {
        dao.getAll(req.session.userData.user_id, (err, result) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else {
                result.forEach(e => e.started.setHours(12));
                req.session.userData.expenses = result;
                log('returning expenses');
                resp.send(result);
            }
        });
    }
};

_route.getTotals = (req, resp) => {
    log('get expense totals');
    dao.getTotals(
        req.query.auto == 'true',
        new Date(req.get('x-date')),
        req.session.userData.user_id,
        (err, result) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else {
                log('returning totals');
                resp.send(result.reduce((total, e) => {
                    const { cost, frequency } = e;
                    let daily = 0;
                    if (/^\d+$/g.test(frequency)) {
                        daily = cost / frequency;
                    } else if (/^DATE \d+\/\d+$/g.test(frequency)) {
                        daily = cost / 365;
                    } else {
                        daily = cost / 30;
                    }
                    return total + daily;
                }, 0).toString());
            }
        }
    );
};

_route.insert = (req, resp) => {
    log('insert expense');
    const expense = req.body;
    if (_route.isFrequencyValid(expense.frequency)) {
        expense.user_id = req.session.userData.user_id;
        expense.started = new Date(expense.started);
        const { accounts, types } = req.session.userData;
        return new Promise((resolve, reject) => {
            if (
                (!expense.account_id || accounts.some(a => a.id == expense.account_id))
                && types.some(t => t.id == expense.type_id)
            ) {
                resolve(true);
            } else {
                dao.checkEntityOwnership(expense, (err, allowed) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(allowed);
                    }
                });
            }
        }).then(allowed => {
            if (!allowed) {
                log.warn('insert expense, invalid account or type');
                resp.status(400).send('Invalid account or type id');
            } else {
                dao.insert(expense, (err, id) => {
                    if (err) {
                        log.error(err);
                        resp.status(500).send(err.errno == 1062 ? 'An expense with this name already exists' : err);
                    } else {
                        if (expense.automatic) {
                            _route.applyAutoTransactions(true, id, new Date(req.get('x-date')));
                        }
                        req.session.userData.expenses.push({
                            id,
                            ...expense
                        });
                        log('inserted expense');
                        resp.send(id.toString());
                    }
                });
            }
        }).catch(err => {
            log.error(err);
            resp.status(500).send(err);
        });
    } else {
        log.warn('insert expense, invalid frequency');
        resp.status(400).send('Invalid frequency');
    }
};

_route.deleteExpense = (req, resp) => {
    log('delete expense');
    const { id } = req.params;
    dao.deleteExpense(
        id,
        req.session.userData.user_id,
        err => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else {
                req.session.userData.expenses = req.session.userData.expenses.filter(e => e.id != id);
                log('deleted type');
                resp.sendStatus(201);
            }
        }
    );
};

const route = Router();

route.get('/', _route.getAll);
route.get('/total', _route.getTotals);
route.post('/', _route.insert);

route.delete('/:id', _route.deleteExpense);

_route.use('/expenses', route);

_route.lastPaymentDate = (expense, date) => {
    date = new Date(date);
    while (
        !_route.isDayOfPayment(expense.frequency, date, expense.started)
        && date > expense.started
    ) {
        date.setDate(date.getDate() - 1);
    }
    return date;
};

_route.nextPaymentDate = (expense, date) => {
    if (date < expense.started) {
        date = new Date(expense.started);
    } else {
        date = new Date(date);
        date.setDate(date.getDate() + 1);
    }
    while (!_route.isDayOfPayment(expense.frequency, date, expense.started)) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

_route.applyAutoTransactions = (all, id, today = new Date()) => {
    log('applying auto transactions');
    today.setHours(12); 
    dao.getAutoExpenses(all, id, today, (err, result) => {
        if (err) { log.error(err); throw err; }
        let expectedTransactions;
        if (all) {
            expectedTransactions = result.reduce((arr, e) => {
                for (let day = new Date(e.started); day <= today; day.setDate(day.getDate() + 1)) {
                    if (_route.isDayOfPayment(e.frequency, day, e.started)) {
                        arr.push([
                            e.user_id,
                            e.cost,
                            e.name,
                            e.account_id,
                            e.type_id,
                            e.id,
                            new Date(day)
                        ]);
                    }
                }
                return arr;
            }, []);
        } else {
            result = result.filter(e => _route.isDayOfPayment(e.frequency, today, e.started));
            expectedTransactions = result.map(e => ([
                e.user_id,
                e.cost,
                e.name,
                e.account_id,
                e.type_id,
                e.id,
                today
            ]));
        }
        tdao.insertAutoTransactions(
            expectedTransactions,
            err => { if (err) { log.error(err); throw err; } }
        );

    });
};

_route.isDayOfPayment = (() => {
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
            temp.setDate(1); // So we don't accidentally jump 2 months ahead
            temp.setMonth(temp.getMonth() + 1);
            temp.setDate(0);
            while (temp.getMonth() == month) {
                if (accept(temp)) {
                    xDays.push(new Date(temp));
                }
                temp.setDate(temp.getDate() - 1);
            }
            d = -d;
            if (d >= xDays.length) {
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
            const dm = frequency.substring(5).split('/');
            return dm[0] == date.getDate() && dm[1] - 1 == date.getMonth();
        } else if (/^DAY -?\d+$/g.test(frequency)) {
            const d = frequency.substring(4);
            return checkPotentialDays(d, () => true, date);
        } else if (/^DAY (MO|TU|WE|TH|FR|SA|SU) -?\d+$/g.test(frequency)) {
            const d = frequency.substring(7);
            const day = 'SUMOTUWETHFRSA'.indexOf(frequency.substring(4, 6)) / 2;
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
_route.isFrequencyValid = frequency => {
    frequency = frequency.toString().toUpperCase();
    if (/^\d+$/g.test(frequency)) {
        return frequency > 0;
    } else if (/^DATE \d+$/g.test(frequency)) {
        const d = frequency.substring(5);
        return d >= 1 && d <= 31;
    } else if (/^DATE \d+\/\d+$/g.test(frequency)) {
        const dm = frequency.substring(5).split('/');
        const d = parseInt(dm[0]);
        const m = parseInt(dm[1]);

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

module.exports = _route;
