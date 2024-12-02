const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // Modelo de usuario para interactuar con la base de datos
const { comparePassword } = require('../utils/passwords');
const configModel = require('../models/configModel');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const loginAttemptsModel = require('../models/loginAttemptsModel');

// Importamos las dependencias necesarias

// Función para simular un tiempo constante de verificación
const simulateConstantTime = () => {
    return new Promise(resolve => {
        // Simulamos un tiempo constante entre 100-200ms
        const delay = 330 + Math.floor(Math.random() * 50);
        setTimeout(resolve, delay);
    });
};

// Rate limiter para intentos de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por IP
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión',
        error: 'Por favor, intente nuevamente después de 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Definimos el objeto authController que contiene los métodos de autenticación
const authController = {
    login: async (req, res) => {
        const startTime = process.hrtime();
        try {
            // Obtener IP del cliente
            const clientIp = req.ip || 
                           req.connection.remoteAddress || 
                           req.socket.remoteAddress ||
                           req.headers['x-forwarded-for']?.split(',')[0];
            
            const userAgent = req.headers['user-agent'];
            const { correo, contrasena } = req.body;

            // Verificar intentos recientes por IP
            const recentAttempts = await loginAttemptsModel.getRecentAttemptsByIp(clientIp);
            if (recentAttempts > 10) { // Umbral de intentos
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                
                // Registrar el intento bloqueado
                await loginAttemptsModel.registerAttempt(
                    clientIp, 
                    correo, 
                    false, 
                    userAgent
                );

                return res.status(429).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Demasiados intentos fallidos',
                    error: 'Por favor, intente más tarde'
                });
            }

            // Validaciones básicas
            if (!correo || !contrasena) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Datos incompletos',
                    error: 'El correo y la contraseña son obligatorios'
                });
            }

            // Validar formato de correo electrónico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Validación fallida',
                    error: 'Formato de correo electrónico inválido'
                });
            }

            // Validar longitud mínima de la contraseña
            if (contrasena.length < 6) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Validación fallida',
                    error: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Buscamos al usuario en la base de datos por su nombre de usuario
            const user = await userModel.findByEmail(correo);
            // Simulamos tiempo constante independientemente si el usuario existe o no
            await simulateConstantTime();
            // Verificamos si el usuario existe y si la contraseña es correcta
            if (!user || !(await comparePassword(contrasena, user.contrasena))) {
                // Registrar intento fallido
                await loginAttemptsModel.registerAttempt(
                    clientIp, 
                    correo, 
                    false, 
                    userAgent
                );

                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(401).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Credenciales inválidas',
                    error: 'Usuario o contraseña incorrectos'
                });
            }

            // Registrar intento exitoso
            await loginAttemptsModel.registerAttempt(
                clientIp, 
                correo, 
                true, 
                userAgent
            );

            // Verificamos si el usuario está activo
            if (!user.estatus) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(401).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Usuario desactivado',
                    error: 'Contacte al administrador'
                });
            }

            // Obtenemos la configuración del usuario   
            const userConfig = await configModel.findByUserId(user.id);

            const token = jwt.sign(
                {
                    id: user.id,
                    rol: user.rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '12h' }
            );

            // Actualizamos el último login del usuario
            await userModel.updateLastLogin(user.id);

            const userData = {
                id: user.id,
                idClienteTag: user.id_cliente_tag,
                correo: user.correo,
                rol: user.rol,
                nombre: user.nombre,
                apellidoPaterno: user.apellido_paterno,
                apellidoMaterno: user.apellido_materno,
                cliente: user.cliente,
                ultimoLogin: user.ultimo_login,
                configuracion: {
                    nombreImagen: userConfig.nombre_image,
                    nombreLogo: userConfig.nombre_logo,
                    colores: userConfig.colors
                }
            };

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                total: 1,
                tiempoRespuesta: `${responseTime}ms`,
                token,
                usuario: userData
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Método para ver intentos de login (solo admin)
    getLoginAttempts: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const suspiciousAttempts = await loginAttemptsModel.getSuspiciousAttempts();
            
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                total: suspiciousAttempts.length,
                tiempoRespuesta: `${responseTime}ms`,
                intentos: suspiciousAttempts
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al obtener intentos de login',
                error: error.message
            });
        }
    }
};
// Exportamos el controlador de autenticación
module.exports = authController;