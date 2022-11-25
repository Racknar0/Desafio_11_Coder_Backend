

const socket = io();

const nombre_producto = document.getElementById('nombre_producto');
const precio_producto = document.getElementById('precio_producto');
const miniatura_producto = document.getElementById('miniatura_producto');
const btn_submit = document.getElementById('btn_submit');
const email_user = document.getElementById('email_user');
const input_msj = document.getElementById('input_msj');
const btn_enviar_msj = document.getElementById('btn_enviar_msj');
const container_msj = document.getElementById('container_msj');
const faker_productos_table = document.getElementById('faker_productos');
const btn_formulario_login = document.getElementById('btn_formulario_login');
const cotainer_login = document.getElementById('cotainer_login');

const btn_submit_2 = document.getElementById('btn_submit_2');
const email = document.getElementById('email');
const nick = document.getElementById('nick');
const nombre = document.getElementById('nombre');
const apellido = document.getElementById('apellido');
const edad = document.getElementById('edad');
const avatar = document.getElementById('avatar');
const mensaje = document.getElementById('mensaje');
const nombre_usuario = document.getElementById('nombre_usuario');


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');
    async function cargarProductos() {
        fetch('http://localhost:3000/api/productos-test')
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                data.forEach((producto) => {
                    faker_productos_table.innerHTML += `
                    <tr>
                        <td>${producto.title}</td>
                        <td>${producto.price}</td>
                        <td><img src="${producto.thumbnail}" alt="miniatura" width="50px"></td>
                    </tr>
                `;
                });
            });
    }

    async function validateLogin() {
        const response = await fetch('http://localhost:3000/private');
        if (response.status === 401) {
            /* console.log('No estas logueado'); */
            return 
        }

        const data = await response.json();
        const { isAuth, username } = data;

        if (isAuth) {
            cotainer_login.innerHTML = `<div>
            <h2> Bienvenido ${username} </h2>
            <button onclick="logout_fn()" class="btn btn-primary mt-1">Logout</button>
        </div>`;
        }
    }

    cargarProductos();
    validateLogin();
});

btn_formulario_login.addEventListener('click', (e) => {
    e.preventDefault();
    async function login() {
        const data_to_send = {
            username: nombre_usuario.value,
        };
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data_to_send),
        });
        const data = await response.text();
        //recargar la pagina
        location.reload();
        console.log('login? ', data);
    }
    login();
});


function logout_fn() {
    async function logout() {
        const response = await fetch('http://localhost:3000/logout');
        const data = await response.json();
        const { username } = data;
        cotainer_login.innerHTML = `
        <div>
            <h2 class='text-danger'> Adios ${username ? username : ''} </h2>
        </div>`;

        setTimeout(() => {
            location.reload();
        }, 2000);
    }
    logout();
}


btn_submit_2.addEventListener('click', (e) => {
    e.preventDefault();
    const data = {
        author: {
            email: email.value,
            nick: nick.value,
            nombre: nombre.value,
            apellido: apellido.value,
            edad: edad.value,
            avatar: avatar.value,
        },
        mensaje: mensaje.value,
    };

    console.log('Enviando datos al servidor -------- \n', data);
    socket.emit('frontend:formulario', data);
});

socket.on('datos', (data) => {
    console.log('Datos recibidos del servidor productos', data);

    const container_productos = document.getElementById('container_productos');
    container_productos.style = 'width: 600px; margin: 0 auto;';

    container_productos.innerHTML = '';

    /* crear tabla */
    container_productos.innerHTML += `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Miniatura</th>
                </tr>
            </thead>
            <tbody id="tbody_productos">
            </tbody>
        </table>
        `;

    fetch('/template/plantilla.ejs')
        .then((res) => res.text())
        .then((res) => {
            /* console.log('res Fetch----', res); */

            const template = ejs.compile(res);
            const html = template(data);
            /* console.log(html); */
            const tbody_productos = document.getElementById('tbody_productos');
            tbody_productos.innerHTML = html;
        });
});

btn_submit.addEventListener('click', (e) => {
    e.preventDefault();
    const producto = {
        nombre: nombre_producto.value,
        precio: precio_producto.value,
        miniatura: miniatura_producto.value,
    };

    socket.emit('producto_creado', producto);
    console.log('Datos enviados al servidor', producto);
});

function borrarProducto(id) {
    socket.emit('borrar_producto', id);
    console.log('Producto borrado', id);
}

btn_enviar_msj.addEventListener('click', (e) => {
    e.preventDefault();

    if ([email_user.value, input_msj.value].includes('')) {
        alert('Todos los campos son obligatorios');
        return;
    }

    const msj = {
        email: email_user.value,
        msj: input_msj.value,
    };

    socket.emit('msj', msj);
    console.log('Datos enviados al servidor', msj);
});

socket.on('messages', (data) => {
    console.log('Datos recibidos del servidor chat', data);

    container_msj.innerHTML = '';

    data.forEach((msj) => {
        container_msj.innerHTML += `
        <div class="d-flex">
            <p style="color: blue; font-weight: bold; margin-right: 5px">${msj.email} </p>
            <p style="margin-right: 5px">[<span style="color: brown; margin-right: 5px">${msj.hora}</span>] :</p>
            <p style="color: green; font-style: italic;">${msj.msj}</p>
        </div>
        `;
    });
});

/* const datos = { nombre: 'Coder House', curso: 'Web Sockets' };
const textoEjs = `<h1>Nombre curso: <%= nombre %></h1> <h2>Nombre curso: <%= curso %></h2>`;
const template = ejs.compile(textoEjs);
const html = template(datos);
console.log(html);
const template_div = document.getElementById('template_div');
template_div.innerHTML = html; */


