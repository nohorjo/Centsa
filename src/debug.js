const { Router } = require('express');
const log = require('./log');

log('init debug');

const route = Router();

route.get('/', (req, resp) => {
    log('debug request %s', req.ip);
    const data = {
        body: req.body,
        cookies: req.cookies,
        session: req.session,
        params: req.params,
        query: req.query
    };
    resp.send(
        `<h1>Server</h1>
        <pre>${JSON.stringify(data, null, 4)}</pre>
        <h1>Client</h1>
        <pre id="client"></pre>
        <script>
        document.getElementById('client').innerText = JSON.stringify({
            decodedCookies : document.cookie.split(';').reduce((a,b)=>{
                const kv = b.split('=');
                a[kv[0]] = decodeURIComponent(kv[1]);
                return a;
            },{})
        },null,4);
        </script>`);
});

const _route = Router();
_route.use('/debug', route);

module.exports = _route;
