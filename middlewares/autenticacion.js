var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// =================================================
//  VERIFICAR TOKEN --> Middleware
// =================================================

exports.vericaToken = function (req, res, next) {
	var token = req.query.token;
	jwt.verify(token, SEED, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				ok: false,
				mesaje: 'Token no valido - incorrecto',
				errors: err,
			});
		}
		req.usuario = decoded.usuario;
		next();

		// res.status(200).json({
		// 	ok: true,
		// 	decoded,
		// });
	});
};
