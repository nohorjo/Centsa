import { Router } from 'express';
import * as dao from './dao/Accounts';

export const getAll = (req, resp) => {
    dao.getAll(req.session.userData.user_id, (err, result) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(result);
        }
    });
};

export const insert = (req, resp) => {
    const account = (({ name, id }) => ({ name, id }))(req.body);
    account['user_id'] = req.session.userData.user_id;
    if (!account.id) {
        delete account.id;
    }
    dao.insert(account, (err, results) => {
        if (err) {
            console.error(err);
            resp.status(500).send(err);
        } else {
            resp.send(results.insertId.toString());
        }
    });
};

const route = Router();

route.get('/', getAll);
route.post("/", insert);

const _route = Router();
_route.use('/accounts', route);

export default _route;
