const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadLogo, uploadImage } = require('../config/multer');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Middleware para verificar roles permitidos
const checkRoles = (roles) => {
    return (req, res, next) => {
        const startTime = process.hrtime();
        if (!roles.includes(req.user.rol)) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            return res.status(403).json({ 
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'No tienes permisos para realizar esta acción',
                error: 'Rol no autorizado'
            });
        }
        next();
    };
};

const checkOwnership = (req, res, next) => {
    const startTime = process.hrtime();
    const requestedUserId = parseInt(req.params.id);
    if (req.user.rol === 1 && req.user.id !== requestedUserId) {
        const endTime = process.hrtime(startTime);
        const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
        return res.status(403).json({ 
            success: false,
            tiempoRespuesta: `${responseTime}ms`,
            message: 'Solo puedes acceder a tu propia configuración',
            error: 'Acceso no autorizado'
        });
    }
    next();
};

// Ruta para obtener configuración 
router.get('/:id', checkRoles([1, 2, 3]), checkOwnership, configController.getConfig);

// Ruta para actualizar configuración
router.put('/:id', 
    checkRoles([1, 2, 3]),
    checkOwnership,
    (req, res, next) => {
        const startTime = process.hrtime();
        uploadLogo.single('logo')(req, res, (err) => {
            if (err) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({ 
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Error al procesar el logo',
                    error: err.message 
                });
            }
            next();
        });
    },
    (req, res, next) => {
        const startTime = process.hrtime();
        uploadImage.single('image')(req, res, (err) => {
            if (err) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({ 
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Error al procesar la imagen',
                    error: err.message 
                });
            }
            next();
        });
    },
    configController.updateConfig
);

// Ruta para actualizar solo el logo
router.put('/:id/logo', 
    checkRoles([1, 2, 3]),
    checkOwnership,
    uploadLogo.single('logo'),
    configController.updateLogo
);

// Ruta para actualizar solo la imagen
router.put('/:id/image', 
    checkRoles([1, 2, 3]),
    checkOwnership,
    uploadImage.single('image'),
    configController.updateImage
);

// Ruta para actualizar solo los colores
router.put('/:id/colors', 
    checkRoles([1, 2, 3]),
    checkOwnership,
    configController.updateColors
);

module.exports = router;