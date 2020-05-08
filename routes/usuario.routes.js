var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario.models');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

// =================================================
//  LISTA TODOS LOS USUARIOS
// =================================================
app.get('/', (req, res, next) => {
	Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error listado de usuarios',
				errors: err,
			});
		}
		res.status(200).json({
			ok: true,
			usuarios: usuarios,
		});
	});
});

// =================================================
//  ACTUALIZAR USUARIO
// =================================================

app.put('/:id', mdAutenticacion.vericaToken, (req, res, next) => {
	var id = req.params.id;
	var body = req.body;

	Usuario.findById(id, (err, usuario) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al buscar usuario',
				errors: err,
			});
		}
		if (!usuario) {
			return res.status(404).json({
				ok: false,
				mesaje: 'Error usuario con id =' + id + 'no existe',
				errors: { message: 'No existe un usuario con es id' },
			});
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save((err, usuarioGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mesaje: 'Error al actualizar usuario',
					errors: err,
				});
			}
			usuarioGuardado.password = '=)';
			res.status(200).json({
				ok: true,
				usuario: usuarioGuardado,
			});
		});
	});
});

// =================================================
//  CREAR USUARIO
// =================================================

app.post('/', mdAutenticacion.vericaToken, (req, res, next) => {
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		img: body.img,
		role: body.role,
	});
	usuario.save((err, usuarioGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Error al crear usuario',
				errors: err,
			});
		}
		res.status(201).json({
			ok: true,
			usuario: usuarioGuardado,
			usuariotoken: req.usuario,
		});
	});
});

// =================================================
//  ELIMINAR USUARIO POR ID
// =================================================

app.delete('/:id', mdAutenticacion.vericaToken, (req, res, next) => {
	var id = req.params.id;

	Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al borrar usuario',
				errors: err,
			});
		}
		if (!usuarioBorrado) {
			return res.status(400).json({
				ok: false,
				mesaje: 'No existe ese usuario con ese id',
				errors: { message: 'No existe ese usuario con ese id' },
			});
		}
		res.status(200).json({
			ok: true,
			usuario: usuarioBorrado,
		});
	});
});

module.exports = app;
