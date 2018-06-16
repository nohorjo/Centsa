import { Router } from 'express';
import { lastPaymentDate, nextPaymentDate } from './Expenses';
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

// =================== CONTROLLER/CONTROLLEE

route.get('/controllees', (req, resp) => {
    getControllees(req.session.userData.original_user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(result);
        }
    });
});


route.get('/switchUser/:id', (req, resp) => {
    const { userData } = req.session;
    const { id } = req.params;
    const respond = () => {
        resp.cookie('currentUser', id, { maxAge: 31536000000, httpOnly: false });
        resp.sendStatus(201);
    };
    if (id == -1) {
        userData.user_id = userData.original_user_id;
        respond();
    } else {
        isController(userData.original_user_id, id, (err, result) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else if (result) {
                userData.user_id = id;
                respond();
            } else {
                resp.sendStatus(401);
            }
        });
    }
});

route.get('/controllers', (req, resp) => {
    const { userData } = req.session;
    getControllers(userData.user_id, (err, controllers) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
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
    if (email == controllerEmail) {
        resp.sendStatus(400);
    } else {
        addController(user_id, controllerEmail, (err, result) => {
            if (err) {
                console.error(err);
                resp.status(500).send(err);
            } else if(result) {
                resp.sendStatus(201);
            } else {
                resp.sendStatus(404);
            }
        });        
    }
});

route.delete('/controllers/:email', (req, resp) => {
    const { user_id } = req.session.userData;
    deleteController(user_id, req.params.email, (err, id) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            const sessionStore = getSessionStore();
            sessionStore.all((err, sessions) => {
                if (err) console.error(err);
                else Object.keys(sessions).forEach(k => {
                    const { userData } = sessions[k];
                    if (
                        userData
                        && userData.user_id == user_id
                        && userData.original_user_id == id
                    ) {
                        sessionStore.destroy(k);
                    }
                });
            });
            resp.sendStatus(201);
        }
    });        
});

const _route = Router();
_route.use('/general', route);

export default _route;
