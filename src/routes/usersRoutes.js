const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const userModel = require('../models/userModel');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Middleware para verificar si el usuario es admin o root
const checkAdminOrRoot = (req, res, next) => {
    const startTime = process.hrtime();
    // roles: 1 = cliente, 2 = admin, 3 = root
    if (req.user.rol !== 2 && req.user.rol !== 3) {
        const endTime = process.hrtime(startTime);
        const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        return res.status(403).json({
            success: false,
            tiempoRespuesta: `${responseTime}ms`,
            message: 'No tienes permisos para realizar esta acción',
            error: 'INSUFFICIENT_PERMISSIONS'
        });
    }
    next();
};

// Middleware para verificar si el usuario es root
const checkRoot = (req, res, next) => {
    const startTime = process.hrtime();
    if (req.user.rol !== 3) {
        const endTime = process.hrtime(startTime);
        const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        return res.status(403).json({
            success: false,
            tiempoRespuesta: `${responseTime}ms`,
            message: 'Solo los usuarios root pueden realizar esta acción',
            error: 'ROOT_ACCESS_REQUIRED'
        });
    }
    next();
};

// Middleware para verificar propiedad y permisos de actualización de contraseña
const checkPasswordUpdatePermission = async (req, res, next) => {
    const startTime = process.hrtime();
    const requestedUserId = parseInt(req.params.id);
    const userRole = req.user.rol;
    
    // Validar que el ID sea un número válido
    if (isNaN(requestedUserId)) {
        const endTime = process.hrtime(startTime);
        const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        return res.status(400).json({
            success: false,
            tiempoRespuesta: `${responseTime}ms`,
            message: 'ID de usuario inválido',
            error: 'INVALID_USER_ID'
        });
    }
    
    // Si es cliente, solo puede actualizar su propia contraseña
    if (userRole === 1 && req.user.id !== requestedUserId) {
        const endTime = process.hrtime(startTime);
        const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        return res.status(403).json({
            success: false,
            tiempoRespuesta: `${responseTime}ms`,
            message: 'Solo puedes actualizar tu propia contraseña',
            error: 'UNAUTHORIZED_PASSWORD_UPDATE'
        });
    }
    
    // Si es admin, puede actualizar su propia contraseña y la de los clientes
    if (userRole === 2) {
        try {
            const targetUser = await userModel.getUserRole(requestedUserId);
            if (!targetUser || (targetUser.rol !== 1 && req.user.id !== requestedUserId)) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(403).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Solo puedes actualizar tu propia contraseña y la de los clientes',
                    error: 'UNAUTHORIZED_PASSWORD_UPDATE'
                });
            }
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            return res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error interno al verificar permisos',
                error: error.message
            });
        }
    }
    
    // Los usuarios root pueden actualizar cualquier contraseña
    next();
};

// Ruta para crear usuarios tipo cliente
router.post('/crear-cliente', checkAdminOrRoot, userController.createUserCliente);

// Ruta para crear usuarios administradores (solo root)
router.post('/crear-admin', checkRoot, userController.createUserAdmin);

// Ruta para crear usuarios root (solo root)
router.post('/crear-root', checkRoot, userController.createUserRoot);

// Ruta para actualizar estatus
router.put('/:id/estatus', checkAdminOrRoot, userController.updateUserStatus);

// Ruta para actualizar contraseña
router.put('/:id/contrasena', checkPasswordUpdatePermission, userController.updatePassword);

// Ruta para obtener todos los usuarios de tipo clientes (admins y root pueden ver)
router.get('/clientes', checkAdminOrRoot, userController.getClients);

// Ruta para obtener todos los usuarios (solo root puede ver)
router.get('/todos', checkRoot, userController.getAllUsers);

module.exports = router;

