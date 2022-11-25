/* const express = require('express') */
import express from 'express';

import passport from 'passport'
import UserController from '../controller/userController.js';
const { Router } = express
const router = Router()

let id = 1

router.post('/sign-in', passport.authenticate('sign-in'), (req, res) => { // <--- 'sign-in' is the name of the strategy
    //successRedirect: '/api/users/me', // <--- Redirige a la ruta '/api/users/me' si el usuario se loguea correctamente
    const { user } = req
    if(!req.isAuthenticated()) { 
        res.status(401).json({ message: 'Correo o contraseña incorrectos' })
        return
    }
    res.status(200).json({ message: `El usuario ${user.email} se ha logueado correctamente` })
})

router.post('/sign-up', passport.authenticate('sign-up'), (req, res) => { 
    
    const { user } = req
    const userCreated = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        _id: user._id
    }
    res.status(200).json(userCreated)
})


router.post('/sign-out', (req, res, next) => {
    const { user } = req
    req.logout((error) => {
        if(error) {
            return next(error)
        }
        res.status(200).json({ message: `El usuario ${user.email} se ha deslogueado correctamente` })
    })
})

/*********** RUTAS PRIVADAS *****************/
const isAuth = (req, res, next) => {
    if(req.isAuthenticated()) { // Si el usuario está logueado
        next()
    } else {
        res.status(401).json({ message: 'No estás autorizado para acceder a esta ruta dirigete a /login' })
    }
}


router.get('/me', isAuth, async (req, res, next) => {
    //console.log('req.session.passport', req.session.passport);
    try {
      const user = await UserController.getByid(req.user._id)
      res.json(user)
    } catch (error) {
      next(error)
    }
  })

/* ******************************************** */



router.get('/login', function(req, res, next) {
    try {
        res.render('login', { title: 'Login' });
    } catch (error) {
        console.log(error)
    }
})

router.get('/register', function(req, res, next) {
    try {
        res.render('register', { title: 'Register' });
    } catch (error) {
        console.log(error)
    }
})

router.get('/home', isAuth, (req, res) => {
    try {
        const data = {
            title: 'Coder House Web Sockets',
        }
        res.render('index', data);
    } catch (error) {
        console.log(error);
    }
});

/* fail-login */
router.get('/fail-login', (req, res) => {
    try {
        res.render('fail-login', { title: 'Fail Login' });
    } catch (error) {
        console.log(error)
    }
})

/* fail-register */
router.get('/fail-register', (req, res) => {
    try {
        res.render('fail-register', { title: 'Fail Register' });
    } catch (error) {
        console.log(error)
    }
})


export default router
















/* router.post('/productos',   (req, res) => {
    const { title, price, thumbnail } = req.body
    console.log(req.body);
    const producto = { id: ++id, title, price, thumbnail }
    productos.push(producto)
    res.redirect('/')
}) */


/* router.get('/productos', (req, res) => {
    res.json(productos)
})

router.get('/productos/:id', (req, res) => {
    const { id } = req.params
    const producto = productos.find((producto) => producto.id == id)
    res.json(producto)
})


router.post('/productos',   (req, res) => {
    const { title, price, thumbnail } = req.body
    console.log(req.body);
    const producto = { id: ++id, title, price, thumbnail }
    productos.push(producto)
    res.json(producto)
    console.log(productos);
})

router.put('/productos/:id', (req, res) => {
    const { id } = req.params
    const { title, price, thumbnail } = req.body
    const producto = productos.find((producto) => producto.id == id)
    producto.title = title
    producto.price = price
    producto.thumbnail = thumbnail
    res.json(producto)
})

router.delete('/productos/:id', (req, res) => {
    const { id } = req.params
    const producto = productos.find((producto) => producto.id == id)
    productos.splice(productos.indexOf(producto), 1)
    res.json(producto)
}) */

/* 
module.exports = router */