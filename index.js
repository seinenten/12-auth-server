const express = require('express');
const cors = require('cors');
const path = require('path');

const { dbConnection } = require('./db/config');
require('dotenv').config(); 

console.log( process.env );

//Crear el servidor/aplicacion d eexpress
const app = express();

// Base de datos
dbConnection();

//Directorio Publico 
app.use( express.static('public') );

//CORS
app.use( cors() );

// Lectura y parseo del body
app.use( express.json() );

// Rutas
app.use( '/api/auth', require('./routes/auth') );

//Manejar todas las posibles rutas
app.get( '*', (req, res) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html' ) );
})

app.listen( process.env.PORT , () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});