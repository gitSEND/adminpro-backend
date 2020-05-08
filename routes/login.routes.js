var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario.models');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

app.post('/', (req, res) => {
	var body = req.body;
	Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al buscar usuario',
				errors: err,
			});
		}
		if (!usuarioDB) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Credenciales incorrectas -email',
				errors: err,
			});
		}
		if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Credenciales incorrectas -password',
				errors: err,
			});
		}

		//CREAR UN TOKEN
		usuarioDB.password = '=)';
		var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

		res.status(200).json({
			ok: true,
			usuarioDB,
			token,
			id: usuarioDB.id,
		});
	});
});

module.exports = app;
