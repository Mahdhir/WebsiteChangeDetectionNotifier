var
    cors = require('cors'),
    http = require('http'),
    express = require('express'),
    dotenv = require('dotenv'),
    bodyParser = require('body-parser'),
    request = require('request');

var app = express();
dotenv.config();
const BOT_ID = process.env.BOT_ID;
const CHAT_ID = process.env.CHAT_ID;
const API_URL = "https://api.telegram.org/bot";





app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());


const sendTelegramMessage = params =>{
    return new Promise((resolve, reject) => {
        const MSG = `chat_id=${CHAT_ID}&parse_mode=Markdown&text=${params.url} has a change of ${params.change} on ${params.datetime}`;
        request.get(API_URL+BOT_ID+"/sendMessage?"+MSG,{

        }, (err, resp) => err ? reject(err) : resolve(resp));
    })
        .then(resp => {
            if (resp.statusCode != 200) {
                return Promise.reject({
                    error_code: resp.error_code,
                    description: resp.description
                });
            }
            return Promise.resolve(resp.body);
        })
        .catch(err => {
            return Promise.reject({
                error_code: 500,
                description: JSON.stringify({})
            });
        });
}

const sendTelegramPhoto = params =>{
    return new Promise((resolve, reject) => {
        var photo = params.photo.replace(/\\/g, '');
        const MSG = `chat_id=${CHAT_ID}&parse_mode=Markdown&caption=${params.caption}&photo=${params.photo}`;
        request.get(API_URL+BOT_ID+"/sendPhoto?"+MSG,{

        }, (err, resp) => err ? reject(err) : resolve(resp));
    })
        .then(resp => {
            if (resp.statusCode != 200) {
                return Promise.reject({
                    error_code: resp.error_code,
                    description: resp.description
                });
            }
            return Promise.resolve(resp.body);
        })
        .catch(err => {
            return Promise.reject({
                error_code: 500,
                description: JSON.stringify({})
            });
        });
}
app.get('/',(req,res) => {
    return res.send('Hello');
});

app.post('/webhook', (req, res) => {

    const params = req.body;

    sendTelegramMessage({
        url:params.url,
        change:params.change,
        datetime:params.datetime
    })
        .then(result => {
            if(!params.preview){
                return res.status(422).json({status:"NO IMAGE FOUND"});
            }
                sendTelegramPhoto({
                    caption:"Original Screenshot",
                    photo:params.original
                })
                .then(result => {
                    sendTelegramPhoto({
                        caption:"New Screenshot",
                        photo:params.preview
                    })
                    .then(result => {
                        return res.send({status:"OK"});
                    })
                    .catch(response => {
                        return res.json(response);
                    })
                })
                .catch(response => {
                    return res.json(response);
                })
            
        })
        .catch(response => {
            return res.json(response);
        });
});



// Start the server
var server = http.createServer(app);

server.listen(process.env.PORT || 5000, function (err) {
    console.info('listening in http://localhost:8080');
});


