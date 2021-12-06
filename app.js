const express = require('express');
const app = express();
const socketio = require("socket.io");

app.set('port', process.env.PORT || 3000);

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');

dotenv.config({path:'./env/.env'});

app.use(express.static('/public'));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')

const bcrypt = require('bcryptjs');

const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

const connection = require('./database/db.js');

app.post('/register', async (req, res)=>{
    const user = req.body.username;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = await bcrypt.hash(req.body.pass, 8);
    connection.query('INSERT INTO users SET ?', {
        user:user,
        name:name,
        rol:rol,
        pass:pass
    }, async (err, results)=>{
        if(err) {
            console.log(err);
        } else {
            res.render('login.ejs');
        }
    })
})

app.post('/auth', async (req, res)=>{
    const user = req.body.username;
    const pass = await req.body.pass;
    if(user && pass) {
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (err, results)=>{
            if(results.lenght == 0 || !(await bcrypt.compare(pass, results[0].pass))){
                res.send('Error');
            } else {
                req.session.loggedin = true;
                req.session.user = results[0].user;
                req.session.name = results[0].name;
                req.session.userid = results[0].id;
                res.redirect('/')
            }
        })
    } else {
        res.send('Ingrese usuario y contraseña');
    }
})

app.get('/', (req, res)=>{
    if(req.session.loggedin) {
        connection.query("SELECT * FROM messages AS ms INNER JOIN users AS us ON us.id = ms.id_usuario ORDER BY ms.id DESC", (err, rows)=>{
            if(err) {
                res.render("index.ejs", {
                    login:false,
                    user:req.session.user,
                    name:req.session.name,
                    userid:req.session.userid,
                    data: ""
                });
            } else {
                res.render("index.ejs", {
                    login:true,
                    user:req.session.user,
                    name:req.session.name,
                    userid:req.session.userid,
                    rows: rows
                })
            }
        });
    } else {
        res.render('index.ejs', {
            login:false,
            user:'Debe iniciar sesion'
        })
    }
})

app.get('/register', (req, res)=>{
    if(req.session.loggedin) {
        res.redirect('/')
    } else {
        res.render('register.ejs');
    }
})

app.get('/login', (req, res)=>{
    if(req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('login.ejs');
    }
})

app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    })
})

const server = app.listen(app.get('port'), (req, res)=>{
    console.log('Server at port: ', app.get('port'));
})

const io = socketio(server);

io.on("connection", (socket)=> {
    console.log("New connection", socket.id);
    socket.on("mensaje", (data)=>{
        connection.query("INSERT INTO messages SET ?", {
            message: data.message,
            id_usuario: data.userid
        }, (err, results)=>{
            if(err){
                console.log(err);
            }
        })
        io.sockets.emit("mensaje", data);
    })
})