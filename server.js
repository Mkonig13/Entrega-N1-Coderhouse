const express = require('express');
const path = require('path');
const http = require('http');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');

const productsRouter = require('./routes/api/products.router');
const cartsRouter = require('./routes/api/carts.router');
const viewsRouter = require('./routes/views.router');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

// Hacemos disponible io para las rutas HTTP (req.app.get('io'))
app.set('io', io);

// Configuración de Handlebars
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de vistas
app.use('/', viewsRouter);

// Rutas base de API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Configuración de websockets
io.on('connection', (socket) => {
  console.log('Cliente conectado a WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP + WebSocket escuchando en el puerto ${PORT}`);
});
