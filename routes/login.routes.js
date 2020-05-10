var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario.models');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//GOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
// =================================================
//  AUTENTICAS GOOGLE
// =================================================
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	// const userid = payload['sub'];
	// If request specified a G Suite domain:
	//const domain = payload['hd'];

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
	};
}
app.post('/google', async (req, res) => {
	var token = req.body.token;
	var googleUser = await verify(token).catch((e) => {
		return res.status(403).json({
			ok: false,
			mensaje: 'Token no valido',
		});
	});

	Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Ocurrio un error al autenticarse con google',
				errors: err,
			});
		}
		if (usuario) {
			if (usuario.google === false) {
				return res.status(400).json({
					ok: false,
					mesaje: 'Debe de usar su autenticación normal',
				});
			} else {
				var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });
				res.status(200).json({
					ok: true,
					usuario: usuario,
					token: token,
					id: usuario.id,
				});
			}
		} else {
			//EL USUARIO NO EXISTE -> HAY QUE CREARLO
			var usuario = new Usuario();
			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = '=)';

			usuario.save((err, usuario) => {
				var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });
				res.status(200).json({
					ok: true,
					usuario: usuario,
					token: token,
					id: usuario.id,
				});
			});
		}
	});

	// return res.status(200).json({
	// 	ok: true,
	// 	mensaje: 'Logueo exitoso...!!',
	// 	googleUser,
	// });
});

// =================================================
//  AUTENTICAS NORMAL
// =================================================

app.post('/', (req, res) => {
	var body = req.body;
	Usuario.findOne({ email: body.email }, (err, usuario) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al buscar usuario',
				errors: err,
			});
		}
		if (!usuario) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Credenciales incorrectas -email',
				errors: err,
			});
		}
		if (!bcrypt.compareSync(body.password, usuario.password)) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Credenciales incorrectas -password',
				errors: err,
			});
		}

		//CREAR UN TOKEN
		usuario.password = '=)';
		var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

		res.status(200).json({
			ok: true,
			usuario,
			token,
			id: usuario.id,
		});
	});
});

module.exports = app;
