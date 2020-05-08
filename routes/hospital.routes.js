var express = require('express');
var app = express();
var Hospital = require('../models/hospital.models');
var mdAutenticacion = require('../middlewares/autenticacion');

// =================================================
//  LISTA TODOS LOS HOSPITALES
// =================================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Hospital.find({})
		.skip(desde)
		.limit(5)
		.populate('usuario', 'nombre email')
		.exec((err, hospitales) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mesaje: 'Error listado de hospitales',
					errors: err,
				});
			}

			Hospital.count({}, (err, conteo) => {
				res.status(200).json({
					ok: true,
					hospitales: hospitales,
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

	Hospital.findById(id, (err, hospital) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al buscar hospital',
				errors: err,
			});
		}
		if (!hospital) {
			return res.status(404).json({
				ok: false,
				mesaje: 'Error hospital con id =' + id + 'no existe',
				errors: { message: 'No existe un hospital con es id' },
			});
		}

		hospital.nombre = body.nombre;
		hospital.usuario = req.usuario._id;

		hospital.save((err, hospitalGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mesaje: 'Error al actualizar hospital',
					errors: err,
				});
			}
			hospitalGuardado.password = '=)';
			res.status(200).json({
				ok: true,
				hospital: hospitalGuardado,
			});
		});
	});
});

// =================================================
//  CREAR HOSPITALES
// =================================================

app.post('/', mdAutenticacion.vericaToken, (req, res, next) => {
	var body = req.body;

	var hospital = new Hospital({
		nombre: body.nombre,
		usuario: req.usuario._id,
	});
	hospital.save((err, hospitalGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mesaje: 'Error al crear hospital',
				errors: err,
			});
		}
		res.status(201).json({
			ok: true,
			hospital: hospitalGuardado,
		});
	});
});

// =================================================
//  ELIMINAR HOSPITAL POR ID
// =================================================

app.delete('/:id', mdAutenticacion.vericaToken, (req, res, next) => {
	var id = req.params.id;

	Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mesaje: 'Error al borrar hospital',
				errors: err,
			});
		}
		if (!hospitalBorrado) {
			return res.status(400).json({
				ok: false,
				mesaje: 'No existe ese hospital con ese id',
				errors: { message: 'No existe ese hospital con ese id' },
			});
		}
		res.status(200).json({
			ok: true,
			hospital: hospitalBorrado,
		});
	});
});

module.exports = app;
