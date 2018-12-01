const { Router } = require('express');
const dao = require('./dao/Accounts');
const log = require('./log');

log('init accounts');

const route = Router();

route.getAll = (req, resp) => {
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
                result.forEach(a => a.balance = a.balance || 0);
                req.session.userData.accounts = result;
                log('returning accounts');
                resp.send(result);
            }
        });
    }
};

route.insert = (req, resp) => {
    log('insert account');
    const account = (({ name, id }) => ({ name, id }))(req.body || {});
    account['user_id'] = req.session.userData.user_id;
    if (!account.id) {
        delete account.id;
    }
    dao.insert(account, (err, id) => {
        if (err) {
            log.error(err);
            resp.status(500).send(err);
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


route.get('/', route.getAll);
route.post("/", route.insert);

const _route = Router();
_route.use('/accounts', route);

module.exports = _route;
