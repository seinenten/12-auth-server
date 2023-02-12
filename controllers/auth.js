const { response } = require('express');
const Usuario = require( '../models/Usuario' );
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

// Registrar usuario
const crearUsuario =  async(req,res = response) => {

    const {  email, name , password } = req.body;

    try {
        // Verificar el email que no exista ya
        const usuario = await Usuario.findOne( { email });

        if( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe con ese email'
            });
        }

        //Crear usuario con el modelo
        const dbUser = new Usuario( req.body );

        // Hashear la contraseña
        const salt = bcrypt.genSaltSync();
        dbUser.password = bcrypt.hashSync( password, salt );

        //Generar el JWT
        const token = await generarJWT( dbUser.id, name );

        // Crear usuario de DB
        await dbUser.save();

        // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            uid: dbUser.id,
            name,
            email,
            token
        });


    } catch (error) {

        console.log(error)
        return res.json({
            ok: true,
            msg: 'Por favor hable con el administrador'
        });

    }
    

}

const revalidarToken =  async(req,res = response) => {

    const { uid } = req;

    // Leer la base de datos
    const dbUser = await Usuario.findById(uid);



    //Generar nuevo JWT 
    const token = await generarJWT( uid, dbUser.name);


    return res.json({
        ok: true,
        uid,
        name: dbUser.name,
        email: dbUser.email,
        token
    });

}

const loginUsuario = async(req,res = response) => {

    const {  email, password } = req.body;

    try {

        // Verificamos si el correo existe

        const dbUser = await Usuario.findOne( {email});

        if (!dbUser) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo no existe'
            });
        }

        // Si llega a este punto el correo existe asi que vamos a verificar la contraseña si es igual a la ya registrada

        const validPassword = bcrypt.compareSync( password, dbUser.password );

        if (!validPassword){
            return res.status(400).json({
                ok: false,
                msg: 'El password no es valido'
            });
        }

        //Generar el JWT si existe la cuenta
        const token = await generarJWT( dbUser.id, dbUser.name );

        // respuesta del servicio
        return res.json({
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            token
        });
        
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}



module.exports = {
    crearUsuario,
    revalidarToken,
    loginUsuario
}