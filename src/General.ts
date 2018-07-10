import { Router } from 'express';
import {
    lastPaymentDate,
    nextPaymentDate,
    isDayOfPayment
} from './Expenses';
import { getAllWithSum } from './dao/Expenses';
import * as rules from './dao/Rules';
import {
    getControllees,
    isController,
    getControllers,
    addController,
    deleteController
} from './dao/Users';
import { getSessionStore } from './index';
import log from './log';
import { getSummary } from './dao/Transactions';

log('init general');

const route = Router();

const DAY = 8.64e7;
const SAVING_TEST = /Saving \d{4}\/\d{2}\/\d{2}: /;

route.get("/budget", (req, resp) => {
    const mode = JSON.parse(req.query.budgetMode);
    const { userData : { user_id } } = req.session;
    const today:any = new Date(req.get('x-date'));
    log('get budget', mode);
    switch (mode.mode) {
        case 'expense': case 'strictExpense':
            getAllWithSum(user_id, (err, results) => {
                if (err) {
                    log.error(err);
                    resp.status(500).send(err);
                } else {
                    const expenses = results[1];
                    const strict = mode.mode == 'strictExpense';
                    const multiplier = mode.expenseRounds - 1 || 0;
                    const currentDay = new Date(req.get('x-date')).valueOf();

                    const budget = expenses.reduce(
                        (currentBudget, expense) => {
                            if (expense.cost > 0 && expense.started < new Date(currentDay)) {
                                let { cost } = expense;
                                if (!strict) {
                                    const timeToNextPayment = nextPaymentDate(expense, currentDay) - currentDay;
                                    const timeSinceLastPayment = currentDay - lastPaymentDate(expense, currentDay);

                                    cost *= timeSinceLastPayment / (timeSinceLastPayment + timeToNextPayment);
                                }
                                cost += multiplier * expense.cost;
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
                    log('returning budget');
                    resp.send(budget);
                }
            });
            break;
        case 'manual':
            const start:any = new Date(mode.start);
            getSummary(user_id, {
                comment: '%%',
                fromDate: start,
                toDate: today,
                fromAmount: Number.MIN_SAFE_INTEGER,
                toAmount: Number.MAX_SAFE_INTEGER
            }, (err, [{sum}]) => {
                if (err) {
                    log.error(err);
                    resp.status(500).send(err);
                } else {
                    const days = (today - start) / DAY;
                    log('returning budget');
                    resp.send({afterAll: Math.ceil(days / mode.frequency) * mode.amount - sum});
                }
            });
            break;
        case 'time':
            getAllWithSum(user_id, (err, results) => {
                if (err) {
                    log.error(err);
                    resp.status(500).send(err);
                } else {
                    let expenses = results[1];
                    const current = new Date(today);
                    const end = new Date(today.getTime() + mode.days * DAY);
                    let afterAll = results[0][0].total
                                    - expenses.filter(e => SAVING_TEST.test(e.name)).map(e => e.cost).reduce((a, b) => a + b, 0);
                    let afterAuto = afterAll;

                    expenses = expenses.filter(e => e.cost > 0 && !SAVING_TEST.test(e.name));

                    while (current <= end) {
                        const currentExpenses = expenses.filter(e => isDayOfPayment(e.frequency, current, e.started));
                        afterAll -= currentExpenses.map(e => e.cost)
                            .reduce((a, b) => a + b, 0);
                        afterAuto -= currentExpenses.filter(e => e.automatic)
                            .map(e => e.cost)
                            .reduce((a, b) => a + b, 0);
                        current.setDate(current.getDate() + 1);
                    }
                    
                    log('returning budget');
                    resp.send({afterAll, afterAuto});
                }
            }); 
            break;
        default:
            log.warn('invalid budget type');
            resp.status(400).send('Invalid budget type');
            break;
    }
});

// =================== IMPORT
route.get("/rules", (req, resp) => {
    log('get all rules');
    rules.getAll(req.session.userData.user_id, (err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning rules');
            resp.send(result);
        }
    });
});

route.post("/rule/:name", (req, resp) => {
    const { name } = req.params;
    log('insert rule %s', name);

    if (name && name != 'Default') {
        rules.insert(
            name,
            req.session.userData.user_id,
            req.body.script,
            (err, id) => {
                if (err) {
                    log.error(err);
                    resp.status(500).send(err);
                } else {
                    log('inserted rule');
                    resp.send(id.toString());
                }
            }
        );
    } else {
        resp.status(400).send("Invalid name");
    }
});

route.get("/rule/:id", (req, resp) => {
    log('get rule');
    rules.getRule(req.params.id, req.session.userData.user_id, (err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning rule');
            resp.send(result[0].content);
        }
    });
});

// =================== CONTROLLER/CONTROLLEE

route.get('/controllees', (req, resp) => {
    log('get controllees');
    getControllees(req.session.userData.original_user_id, (err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning controllees');
            resp.send(result);
        }
    });
});


route.get('/switchUser/:id', (req, resp) => {
    const { userData } = req.session;
    const { id } = req.params;
    log('user %d switching to %d', userData.original_user_id, id);

    const respond = () => {
        log('switched user');
        resp.cookie('currentUser', id, { maxAge: 31536000000, httpOnly: false });
        resp.sendStatus(201);
    };
    if (id == -1) {
        userData.user_id = userData.original_user_id;
        respond();
    } else {
        isController(userData.original_user_id, id, (err, result) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else if (result) {
                userData.user_id = id;
                respond();
            } else {
                log.warn('unauthorised switch attempt');
                resp.sendStatus(401);
            }
        });
    }
});

route.get('/controllers', (req, resp) => {
    log('get controllers');
    const { userData } = req.session;
    getControllers(userData.user_id, (err, controllers) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning controllers');
            resp.send({
                email: userData.email,
                controllers
            });
        }
    });
});

route.post('/controllers', (req, resp) => {
    const controllerEmail = req.body.email;
    const { email, user_id } = req.session.userData;
    log('adding controller %s to %d', controllerEmail, user_id);
    if (email == controllerEmail) {
        log('controller and controllee the same');
        resp.sendStatus(400);
    } else {
        addController(user_id, controllerEmail, (err, result) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else if(result) {
                log('controller added');
                resp.sendStatus(201);
            } else {
                log('controller not found');
                resp.sendStatus(404);
            }
        });        
    }
});

route.delete('/controllers/:email', (req, resp) => {
    const { user_id } = req.session.userData;
    log('removing controller by %d', user_id);
    deleteController(user_id, req.params.email, (err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            const sessionStore = getSessionStore();
            sessionStore.all((err, sessions) => {
                if (err) log.error(err);
                else Object.keys(sessions).forEach(k => {
                    const { userData } = sessions[k];
                    if (
                        userData
                        && userData.user_id == user_id
                        && userData.original_user_id == id
                    ) {
                        log('destroying session of %d', id);
                        sessionStore.destroy(k);
                    }
                });
            });
            log('returning from session deletion');
            resp.sendStatus(201);
        }
    });        
});

const _route = Router();
_route.use('/general', route);

export default _route;
