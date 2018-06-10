import { Router } from 'express';
import * as dao from './dao/Accounts';
import log from './log';

log('init accounts');

export const getAll = (req, resp) => {
    log('get all accounts');
    dao.getAll(req.session.userData.user_id, (err, result) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('returning accounts');
            result.forEach(a => a.balance = a.balance || 0);
            resp.send(result);
        }
    });
};

export const insert = (req, resp) => {
    log('insert account');
    const account = (({ name, id }) => ({ name, id }))(req.body);
    account['user_id'] = req.session.userData.user_id;
    if (!account.id) {
        delete account.id;
    }
    dao.insert(account, (err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
        } else {
            log('inserted account');
            resp.send(id.toString());
        }
    });
};

const route = Router();

route.get('/', getAll);
route.post("/", insert);

const _route = Router();
_route.use('/accounts', route);

export default _route;
