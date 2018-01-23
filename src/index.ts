import * as express from 'express';

let port = process.env.PORT || 8080;

const app = express();

app.get(['/', ''], (req, res) => res.redirect('/index.html'));

app.use(express.static('static'));

app.listen(port, () => console.log(`Server listening on port ${port}`));