import { Router } from 'express';

const route = Router();


const _route = Router();
_route.use('/types', route);

export default _route;