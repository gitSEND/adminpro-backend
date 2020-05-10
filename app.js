//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

// Configurar cabeceras y cors
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
	);
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

//Body-Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Conexion a la base de datos
mongoose.connect(
	'mongodb://localhost:27017/hospitalDB',
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err, res) => {
		if (err) throw err;
		console.log('Base de datos online');
	}
);
mongoose.set('useCreateIndex', true);

//Importar Rutas
var appRoutes = require('./routes/app.routes');
var usuarioRoutes = require('./routes/usuario.routes');
var loginRoutes = require('./routes/login.routes');
var hospitalRoutes = require('./routes/hospital.routes');
var medicoRoutes = require('./routes/medico.routes');
var busquedaRoutes = require('./routes/busqueda.routes');
var uploadRoutes = require('./routes/upload.routes');
var imagenesRoutes = require('./routes/imagenes.routes');

//Escuchar peticiones
app.listen(3000, () => {
	console.log('Express server puerto 3000 online');
});

//SERVER INDEX CONFIG
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);
