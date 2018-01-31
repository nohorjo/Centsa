import * as express from 'express';
import * as bodyParser from 'body-parser';
import axios from 'axios';

let port = process.env.PORT || 8080;

const app = express();

app.use(express.static('static'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(['/', ''], (req, res) => res.redirect('/index.html'));
app.post('/fb', (req, res) => {
    console.dir(req.body);
    let fields = ['email', 'name'];
    try {
        let url = `https://graph.facebook.com/${req.body.userID}?access_token=${req.body.accessToken}&fields=${fields.join(',')}`;

        axios.get(url).then((resp) => {
            console.dir(resp.data);
            res.send("done");
        }).catch(()=>{
            res.send("error");
        });
    } catch (e) { }
});



app.listen(port, () => console.log(`Server listening on port ${port}`));


