/* const express = require('express') */
import express from 'express';
const { Router } = express
const router = Router()
import { faker } from '@faker-js/faker';

const { name, internet, commerce, random } = faker;

router.get('/api/productos-test', (req, res) => {
    try {
        const productos = [];

        for (let index = 0; index < 5; index++) {
            const producto = {
                id: index,
                title: commerce.productName(),
                price: commerce.price(),
                thumbnail: internet.avatar(),
            }
            productos.push(producto);
        }

        res.json(productos);
    } catch (error) {
        console.log(error);
    }
});

export default router