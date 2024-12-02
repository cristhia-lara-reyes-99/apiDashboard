const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);


// Middleware para verificar si el usuario es admin o root
const checkAdminOrRoot = (req, res, next) => {
    const startTime = process.hrtime();
    try {
        // roles: 1 = cliente, 2 = admin, 3 = root
        if (req.user.rol !== 2 && req.user.rol !== 3) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            
            return res.status(403).json({ 
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'No tienes permisos para realizar esta acción'
            });
        }
        next();
    } catch (error) {
        const endTime = process.hrtime(startTime);
        const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        
        console.error(error);
        res.status(500).json({ 
            success: false,
            tiempoRespuesta: `${responseTime}ms`,
            message: 'Error en la verificación de permisos',
            error: error.message 
        });
    }
};

// Ruta para obtener todos los clientes
router.get('/', checkAdminOrRoot, clientController.getAllClients);

module.exports = router;
