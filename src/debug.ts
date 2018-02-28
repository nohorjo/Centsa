import { Router } from 'express';

const route = Router();

route.get('/', (req, resp) => {
    resp.send(
        JSON.stringify(req.body)
        + JSON.stringify(req.cookies)
        + JSON.stringify(req.session)
        + JSON.stringify(req.params)
        + JSON.stringify(req.query)
    );
});

const _route = Router();
_route.use('/debug', route);

export default _route;