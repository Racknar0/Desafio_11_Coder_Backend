/* const fs = require('fs');
const path = require('path'); */
import fs from 'fs';
import path from 'path';


class ProductosController {
    constructor(productos) {
        this.productos = productos;
    }
    listar() {
        return this.productos;
    }
    listarPorId(id) {
        return this.productos.filter((producto) => producto.id == id);
    }
    guardar(producto) {
        //escritura en archivo json arrProductos.json
        this.productos.push(producto);
        console.log('productos--------', this.productos);
        fs.writeFileSync(path.join(__dirname, '../model/arrProductos.json'), JSON.stringify(this.productos, null, '\t'));
        
    }
    actualizar(id, producto) {
        this.productos = this.productos.map((producto) => {
            if (producto.id == id) {
                producto = producto;
            }
            return producto;
        });
    }
    borrar(id) {
        this.productos = this.productos.filter((producto) => producto.id != id);
    }

}

/* class MessagesController {
    constructor(messages) {
        this.messages = messages;
    }
    listar() {
        return this.messages;
    }
    guardar(message) {
        this.messages.push(message);
        fs.writeFileSync(path.join(__dirname, '../model/messages.json'), JSON.stringify(this.messages, null, '\t'));
    }
}
 */

async function createTable(name, schema) {
    const knexInstance = knex(options); // Instancia de knex con la configuración de la base de datos

    const exist = await knexInstance.schema.hasTable(name); //! Verifica si existe la tabla
    if (exist) {
        console.log(`La tabla ${name} ya existe`);
        return; //! Y termina la función
    }

    try {
        await knexInstance.schema.createTable(name, schema); //! Si no existe, crea la tabla
        console.log(`Tabla ${name} creada`); 
    } catch (error) {
        console.log(error.message);
        throw error; //! Lanza el error para que sea capturado por el catch del app.js
    } finally {
        knexInstance.destroy();
    }
}


/* module.exports = ProductosController; */
/* module.exports = MessagesController; */
export { ProductosController, createTable };

