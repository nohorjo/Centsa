const { Router } = require('express');
const {
    lastPaymentDate,
    nextPaymentDate,
    isDayOfPayment
} = require('./Expenses');
const {
    getAllWithSum,
    deleteExpense
} = require('./dao/Expenses');
const rules = require('./dao/Rules');
const {
    getControllees,
    isController,
    getControllers,
    addController,
    deleteController,
    getUserAETs,
    deleteUser,
    updatePassword,
} = require('./dao/Users');
const { getSessionStore } = require('./index');
const log = require('./log');
const {
    getSummary,
    getAll,
    deleteTransfers,
} = require('./dao/Transactions');
const {
    getNotifications,
    deleteNotification,
    readNotifications,
    addNotification
} = require('./dao/Notifications');
const { logout } = require('./Authentication');
const { createHash } = require('crypto');
const { setSetting } = require('./dao/Settings');
const { deleteAccount } = require('./dao/Accounts');

log('init general');

const route = Router();

const DAY = 8.64e7;
const SAVING_TEST = /^Saving (\d{4}\/\d{2}\/\d{2}): /;
const OUT_TEST = /OUT$/;

route.get('/budget', (req, resp) => {
    const mode = JSON.parse(req.query.budgetMode);
    const { user_id } = req.session.userData;
    const today = new Date(req.get('x-date'));
    log('get budget', mode);
    const respond = budget => {
        log('returning budget');
        if (+mode.cashflowPeriod) {
            getSummary(user_id, {
                fromDate: new Date(today - 8.64e7 * mode.cashflowPeriod),
                toDate: today,
            }, (err, data) => {
                if (err) {
                    log.error(err);
                    resp.status(500).send(err);
                } else {
                    const max = -data[0].sum;
                    resp.send({
                        afterAll: Math.min(max, budget.afterAll),
                        afterAuto: Math.min(max, budget.afterAuto)
                    });
                }
            });
        } else {
            resp.send(budget);
        }
    };
    getAllWithSum(user_id, (err, results) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            let [ [{total}], expenses ] = results;
            expenses.filter(({name}) => {
                const match = name.match(SAVING_TEST);
                if (match) {
                    return today >= new Date(match[1]);
                }
            }).forEach(({
                id,
                name,
                account_id: out_account_id,
            }) => {
                deleteExpense(id, user_id, err => err ? log.error(err) : log('deleted goal', id));
                if (OUT_TEST.test(name)) {
                    const nameStart = name.replace(OUT_TEST, '');
                    const { account_id: in_account_id } = expenses.find(e => e.name.startsWith(nameStart));
                    deleteTransfers(user_id, [in_account_id, out_account_id], `${nameStart}%`, err => {
                        if (err) {
                            log.error(err);
                        } else {
                            deleteAccount(
                                user_id,
                                in_account_id,
                                out_account_id,
                                err => err ? log.error(err) : log('goal account deleted'),
                            );
                        }
                    });
                    addNotification(
                        user_id,
                        `Savings goal ended: ${nameStart.split(SAVING_TEST).pop()}`,
                        err => err ? log.error(err) : log('goal notified'),
                    );
                }
            });
            switch (mode.mode) {
            case 'expense': case 'strictExpense': {
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
                        afterAll: total,
                        afterAuto: total
                    }
                );
                respond(budget);
                break;
            }
            case 'manual': {
                const start = new Date(mode.start);
                getAll(
                    user_id,
                    {
                        fromDate: start,
                        toDate: today,
                    },
                    1,
                    Number.MAX_SAFE_INTEGER,
                    null,
                    (err, transactions) => {
                        if (err) {
                            log.error(err);
                            resp.status(500).send(err);
                        } else {
                            // filter out incomes that are not transfers
                            const sum = transactions.filter(t => t.amount > 0 || transactions.some(u => (
                                u.comment == t.comment
                                && u.date == t.date
                                && u.type_id == t.type_id
                                && u.expense_id == t.expense_id
                                && u.account_id != t.account_id
                                && u.amount == -t.amount
                            ))).reduce((sum, t) => sum + t.amount, 0);
                            const days = (today - start) / DAY;
                            const amount = Math.ceil(days / mode.frequency) * mode.amount - sum;
                            respond({afterAll: amount});
                        }
                    }
                );
                break;
            }
            case 'time': {
                const current = new Date(today);
                const end = new Date(today.getTime() + mode.days * DAY);
                let afterAuto = total;
                let afterAll = afterAuto;

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
                respond({afterAll, afterAuto});
                break;
            }
            default:
                log.warn('invalid budget type');
                resp.status(400).send('Invalid budget type');
                break;
            }
        }
    });
});

// =================== IMPORT
route.get('/rules', (req, resp) => {
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

route.post('/rule/:name', (req, resp) => {
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
        resp.status(400).send('Invalid name');
    }
});

route.get('/rule/:id', (req, resp) => {
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
        log('getting aets');
        getUserAETs(id == -1 ? userData.original_user_id : id, (err, aets) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else {
                log('switched user');
                req.session.userData = {
                    ...userData,
                    ...aets
                };
                resp.cookie('currentUser', id, { maxAge: 31536000000, httpOnly: false });
                resp.sendStatus(201);
            }
        });
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

// =================== NOTIFICATIONS
route.get('/notifications', (req, resp) => {
    const { user_id } = req.session.userData;
    log('getting notifications', user_id);
    getNotifications(user_id, (err, results) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning notifications');
            resp.send(results);
        }
    });
});

route.delete('/notifications/:id', (req, resp) => {
    const { user_id } = req.session.userData;
    const { id } = req.params;
    log('deleting notification', id);
    deleteNotification(user_id, id, err => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('deleted notification');
            resp.sendStatus(201);
        }
    });
});

route.get('/notifications/update', (req, resp) => {
    const { user_id } = req.session.userData;
    log('read notifications', user_id);
    readNotifications(user_id, err => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('updated notification');
            resp.sendStatus(201);
        }
    });
});

route.delete('/deleteUser', (req, resp) => {
    const { user_id, original_user_id } = req.session.userData;
    log('deleting user', user_id);

    if (user_id !== original_user_id) {
        log.warn('controller attempt to delete user', {user_id, original_user_id});
        resp.sendStatus(401);
        return;
    }

    deleteUser(user_id, err => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('deleted user');
            logout(req, resp);
        }
    });
});

route.post('/password', (req, resp) => {
    const { user_id, original_user_id } = req.session.userData;
    log('updating password', user_id);

    if (user_id !== original_user_id) {
        log.warn('controller attempt to change password', {user_id, original_user_id});
        resp.sendStatus(401);
        return;
    }

    req.body.newPassword = createHash('sha256').update(user_id.toString() + req.body.newPassword).digest('base64');
    try {
        req.body.oldPassword = createHash('sha256').update(user_id.toString() + req.body.oldPassword).digest('base64');
    } catch (e) {
        // password is being set for the first time
    }
    updatePassword(user_id, req.body, (err, updated) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else if (updated) {
            setSetting(
                {
                    key: 'password.set',
                    value: true
                },
                user_id,
                err => {
                    if (err) {
                        log.error(err);
                        resp.status(500).send(err);
                    } else {
                        log('updated password');
                        resp.sendStatus(201);
                    }
                }
            );
        } else {
            log.warn('wrong password update', req.ip);
            resp.status(400).send('Wrong password');
        }
    });
});

const _route = Router();
_route.use('/general', route);

module.exports = _route;
