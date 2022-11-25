/* VARIABLES DE CONFIGURACION */
//! usar mysql2 
const mysql2 = {
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '102030',
        database: 'coder_desafio_7'
    },
    pool: { min: 0, max: 7 },
};

//! usar sqlite3 
const sqlite3 = {
    client: 'sqlite3',
    connection: { filename: './db/mydb.sqlite' }
};

/* *********************** */
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import {fileURLToPath} from 'url';
import productos from './router/productosRouter.js';
import apitestrouter from './router/apiTestRouter.js';
import { createTable, selectData, insertData } from './controller/DbController.js';
import expressSession from 'express-session';
import MongoStore from 'connect-mongo';
import mongoConect from './db/mongodbDriver.js';
import userModel from './model/userModel.js';
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import flash from 'connect-flash';
import {hashPassword , isValidPassword, generateToken, verifyToken} from './utils.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8080;
const app = express();
const httpServer = new HttpServer(app);



const oi = new SocketServer(httpServer);

await mongoConect();


/* ********************************************************************************** */
/* ****************************** PASSPORT STRATEGIES ******************************* */

passport.use('sign-up', new LocalStrategy({  // <--- 'sign-up' is the name of the strategy
    usernameField: 'email', //! El campo que se va a usar para el login
    passReqToCallback: true //! Para poder usar el req.body
},  (req, email, password, done) => {
    userModel.findOne({ email }) // Buscar el usuario por el email
        .then((user) => {
            if (!user) {
                console.log(`El usuario se ha creado correctamente`);
                
                 console.log('req.body', req.body);
                    const { firstName, lastName, age } = req.body
                    const newUser = {
                        firstName,
                        lastName,
                        email,
                        age,
                        password: hashPassword(password)
                    }
                    userModel.create(newUser)
                        .then((user) => {
                            return done(null, user)
                        })
                    /* userModel.create(req.body)
                        .then(newUser => {
                            return done(null, newUser);
                        }) */
            } else {
                console.log(`El usuario ya existe`);
                return done(null, false);
            }
            
        })
}));




passport.use('sign-in', new LocalStrategy({  // <--- 'sign-in' is the name of the strategy
    usernameField: 'email', //! El campo que se va a usar para el login
}, (email, password, done) => {
    userModel.findOne({ email }) // Buscar el usuario por el email
        .then(user => {
            if (!user) { // Si el usuario no existe
                console.log(`El usuario ${email} no existe`);
                return done(null, false); //! Retorna un error
            }


            console.log(isValidPassword(password, user.password));
            console.log('password', password);
            console.log('user.password', user.password);
            

            if(isValidPassword(password, user.password)) { // Si la contraseña es correcta
                console.log(`La contraseña es incorrecta`);
                return done(null, false); //! Retorna un error
            }
            console.log(`El usuario ${user.email} se ha logueado correctamente`);
            return done(null, user); //! Retorna el usuario
        })
        .catch(err => {
            console.log(err);
            return done(err); // Retorna un error
        })
}));


passport.serializeUser((user, done) => { //! Guarda el usuario en la sesión
    done(null, user._id);
});

passport.deserializeUser((id, done) => { //! Recupera el usuario de la sesión
    userModel.findOne({ _id: id }) // Buscar el usuario por el id
        .then(user => done(null, user)) // Retorna el usuario
        .catch(err => done(err)); // Retorna un error
});



//! view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public'))); //! aca se declaran los archivos estaticos
app.use(expressSession({
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URL_SESSION || 'mongodb://localhost:27017/ecommerce',
        ttl: 60 //! 60 segundos
    }),
    secret: 'xYzUCAchitO',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize()); //! Inicializa passport
app.use(passport.session()); //! Inicializa passport con sesiones


//! routes
app.use('/', productos);
app.use('/', apitestrouter);


let id = 0;
const messages = [];
//const productosController = new ProductosControllerJSON(arrProductos);


/* ********************************************************************************** */
/* ****************************** SESSION ******************************* */
//! login
/* const USERNAME = 'camilo'; */
app.post('/login_', (req, res) => {
/*     if (req.body.username === USERNAME) { */
        const { username } = req.body;
        req.session.username = username;
        req.session.isAuth = true;
        res.send(`<h1> Bienvenido ${username} </h1>`);
/*     } else {
        res.send(`<h1> Usuario no registrado </h1>`);
    } */
});

//! private
const authMiddleware = (req, res, next) => {
    const { isAuth } = req.session;
    isAuth ? next() : res.status(401).send({
        isAuth : false,
        username : null,
    });
}

app.get('/private', authMiddleware, (req, res) => {
    const { username } = req.session;
    res.status(200).send({
        isAuth: true,
        username,
    });
})

//! logout
app.get('/logout_', (req, res) => {
    const { username } = req.session;
    req.session.destroy(err => {
        if (!err) {
            res.send({
                isAuth: false,
                username,
            });
        } else {
            console.log('Ha ocurrido un error', err.message)
        }
    })
})

/* ********************************************************************************** */
/* ****************************** CREACION DE LA TABLA ******************************* */

try {
    createTable(mysql2 , 'productos', (table) => {
        table.increments('id').primary();
        table.string('nombre', 50).notNullable();
        table.float('precio').notNullable();
        table.string('miniatura').notNullable();
    });

    createTable(sqlite3 ,'chat', (table) => {
        table.increments('id').primary();
        table.string('email', 50).notNullable();
        table.string('hora').notNullable();
        table.string('msj').notNullable();
    });
} catch (error) {
    console.log(error.message);
}




/* ********************************************************************************** */
/* ********************************************************************************** */

const datos = {
    title: 'Coder House Web Sockets',
};

//! on = escuchar
//! emit = emitir
oi.on('connection', async (socket) => {
    /* Evento de conexion */
    //console.log('Nuevo cliente conectado!', socket.id);

    selectData( mysql2 , 'productos').then((data) => {
        socket.emit('datos', {
            ...datos,
            productos: data,
        });
    });

    selectData( sqlite3 , 'chat').then((data) => {
        socket.emit('messages', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado', socket.id);
    });

    socket.on('producto_creado', (data) => {
        console.log('Datos recibidos del cliente', data);

        insertData(mysql2 ,'productos', data)
            .then(() => { selectData(mysql2,'productos')
            .then((data) => {oi.sockets.emit('datos', {...datos, productos: data })})
        });
        ;
    });

    socket.on('msj', (data) => {
        console.log('Datos recibidos del cliente', data);
        //hora  DD/MM/YYYY HH:MM:SS sin am/pm
       /*  messages.push({ ...data, hora: new Date().toLocaleString('es-AR') });
        oi.sockets.emit('messages', messages);
        console.log('Datos enviados al cliente', messages); */

        insertData(sqlite3 ,'chat', { ...data, hora: new Date().toLocaleString('es-AR') }).then(() => {
            selectData(sqlite3,'chat').then((data) => {
                oi.sockets.emit('messages', data);
            })
        });
    });

    socket.on('frontend:formulario', (data) => {
        console.log(data);
        const normalizedData = normalize(data, mensajes);
        print(normalizedData);
    });
});


httpServer.listen(port, () => console.log(`Server running on port ${port}`));