var express = require('express');
var app = express();
var Medico = require('../models/medico.models');
var mdAutenticacion = require('../middlewares/autenticacion');

// =================================================
//  LISTA TODOS LOS HOSPITALES
// =================================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Medico.find({})
		.skip(desde)
		.limit(5)
		.populate('usuario', 'nombre email')
		.populate('hospital')

		.exec((err, medicos) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mesaje: 'Error listado de medicos',
					errors: err,
				});
			}
			Medico.count({}, (err, conteo) => {
				res.status(200).json({
					ok: true,
					medicos: medicos,
					total: conteo,
				});
			});
		});
});

// =================================================
//  ACTUALIZAR HOSPITALES
// =================================================

app.put('/:id', mdAutenticacion.vericaToken, (req, res, next) => {
	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al buscar medico',
				errors: err,
			});
		}
		if (!medico) {
			return res.status(404).json({
				ok: false,
				mesaje: 'Error medico con id =' + id + 'no existe',
				errors: { message: 'No existe un medico con es id' },
			});
		}

		medico.nombre = body.nombre;
		medico.usuario = req.usuario._id;
		medico.hospital = body.hospital;

		medico.save((err, medicoGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mesaje: 'Error al actualizar medico',
					errors: err,
				});
			}
			medicoGuardado.password = '=)';
			res.status(200).json({
				ok: true,
				medico: medicoGuardado,
			});
		});
	});
});

// =================================================
//  CREAR HOSPITALES
// =================================================

app.post('/', mdAutenticacion.vericaToken, (req, res, next) => {
	var body = req.body;

	var medico = new Medico({
		nombre: body.nombre,
		usuario: req.usuario._id,
		hospital: body.hospital,
	});
	medico.save((err, medicoGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Error al crear medico',
				errors: err,
			});
		}
		res.status(201).json({
			ok: true,
			medico: medicoGuardado,
		});
	});
});

// =================================================
//  ELIMINAR HOSPITAL POR ID
// =================================================

app.delete('/:id', mdAutenticacion.vericaToken, (req, res, next) => {
	var id = req.params.id;

	Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al borrar medico',
				errors: err,
			});
		}
		if (!medicoBorrado) {
			return res.status(400).json({
				ok: false,
				mesaje: 'No existe ese medico con ese id',
				errors: { message: 'No existe ese medico con ese id' },
			});
		}
		res.status(200).json({
			ok: true,
			medico: medicoBorrado,
		});
	});
});

module.exports = app;
