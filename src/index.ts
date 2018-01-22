import * as express from 'express';

let port = process.env.PORT || 8080;

const app = express();

app.get(['/', ''], (req,res)=>res.send('Loading'));

app.use(express.static('static'));

app.listen(port);