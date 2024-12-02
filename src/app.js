const express = require('express');
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/usersRoutes');
const configRoutes = require('./routes/configRoutes');
const clientsRoutes = require('./routes/clientsRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);


// 




module.exports = app;
