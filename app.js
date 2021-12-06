const express = require('express');
const app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');

dotenv.config({path:'./env/.env'});

app.use('./resources', express.static('/public'));
app.use('./resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs')

const bcrypt = require('bcryptjs');

const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

const connection = require('./database/db.js');

app.get('/', (req, res)=>{
    res.render('index.ejs');
})


app.listen(app.get('port'), (req, res)=>{
    console.log('Server at port: ', app.get('port'));
})