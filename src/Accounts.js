const { Router } = require('express');
const _ = require('underscore');

const dao = require('./dao/Accounts');
const log = require('./log');

log('init accounts');

const route = Router();
const _route = Router();

_route.getAll = (req, resp) => {
    log('get all accounts');
    if (req.query.light == 'true') {
        log('returning accounts from cache');
        resp.send(req.session.userData.accounts);
    } else {
        dao.getAll(req.session.userData.user_id, (err, result) => {
            if (err) {
                log.error(err);
                resp.status(500).send(err);
            } else {
                req.session.userData.accounts = result;
                log('returning accounts');
                resp.send(result);
            }
        });
    }
};

_route.insert = (req, resp) => {
    log('insert account');
    const account = _.pick(req.body, 'name', 'id', 'savings');
    account['user_id'] = req.session.userData.user_id;
    if (!account.id) {
        delete account.id;
    }
    dao.insert(account, (err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err.errno == 1062 ? 'An account with this name already exists' : err);
        } else {
            const { userData } = req.session;
            userData.accounts = [
                ...userData.accounts.filter(a => a.id != id),
                { id, ...account }
            ];
            log('inserted account');
            resp.send(id.toString());
        }
    });
};

_route.delete = (req, resp) => {
    log('deleting account');
    const {
        params: { id },
        query: { transfer },
        session: { userData },
    } = req;
    dao.deleteAccount(userData.user_id, id, transfer, err => {
        if (err) {
            log.error(err);
            resp.status(500).send(transfer == -1 && err.errno == 1451 ? "This account is part of a 'savings goal'. Please delete that first from the 'expenses' page" : err);
        } else {
            log('deleted account');
            userData.accounts = userData.accounts.filter(a => a.id != id);
            resp.sendStatus(201);
        }
    });
};

route.get('/', _route.getAll);
route.post('/', _route.insert);
route.delete('/:id', _route.delete);

_route.use('/accounts', route);

module.exports = _route;
