const configModel = require('../models/configModel');
const { deleteFile } = require('../utils/fileManager');

const transformConfig = (config) => ({
    colores: config.colors,
    logoNombre: config.nombre_logo,
    imagenNombre: config.nombre_image
});

const configController = {

    updateConfig: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const userId = req.params.id;
            const { colors } = req.body;
            const files = {
                logo: req.file?.fieldname === 'logo' ? req.file : null,
                image: req.file?.fieldname === 'image' ? req.file : null
            };

            const currentConfig = await configModel.findByUserId(userId);
            if (!currentConfig) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(404).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Configuración no encontrada'
                });
            }

            // Objeto para almacenar la nueva configuración
            const newConfig = {
                colors: colors ? JSON.parse(colors) : currentConfig.colors,
                nombre_logo: currentConfig.nombre_logo,
                nombre_image: currentConfig.nombre_image
            };

            // Manejar logo si se envió uno nuevo
            if (files.logo) {
                if (currentConfig.nombre_logo && currentConfig.nombre_logo !== 'default_logo.png') {
                    await deleteFile(`uploads/logos/${currentConfig.nombre_logo}`);
                }
                newConfig.nombre_logo = files.logo.filename;
            }

            // Manejar imagen si se envió una nueva
            if (files.image) {
                if (currentConfig.nombre_image && currentConfig.nombre_image !== 'default_image.png') {
                    await deleteFile(`uploads/images/${currentConfig.nombre_image}`);
                }
                newConfig.nombre_image = files.image.filename;
            }

            await configModel.update(userId, newConfig);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                total: 1,
                configuracion: transformConfig(newConfig)
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error('Error en updateConfig:', error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al actualizar configuración',
                error: error.message
            });
        }
    },

    getConfig: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const userId = req.params.id;
            const config = await configModel.findByUserId(userId);

            if (!config) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(404).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Configuración no encontrada'
                });
            }

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                total: 1,
                configuracion: transformConfig(config)
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al obtener configuración',
                error: error.message
            });
        }
    },

    updateLogo: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const userId = req.params.id;
            const file = req.file;

            if (!file) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'No se proporcionó ningún logo'
                });
            }

            const currentConfig = await configModel.findByUserId(userId);
            if (!currentConfig) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(404).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Configuración no encontrada'
                });
            }

            if (currentConfig.nombre_logo && currentConfig.nombre_logo !== 'default_logo.png') {
                await deleteFile(`uploads/logos/${currentConfig.nombre_logo}`);
            }

            await configModel.updateLogo(userId, file.filename);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                total: 1,
                logo: {
                    mensaje: 'Logo actualizado exitosamente',
                    nombreLogo: file.filename
                }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error('Error en updateLogo:', error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al actualizar el logo',
                error: error.message
            });
        }
    },

    updateImage: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const userId = req.params.id;
            const file = req.file;

            if (!file) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'No se proporcionó ninguna imagen'
                });
            }

            const currentConfig = await configModel.findByUserId(userId);
            if (!currentConfig) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(404).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Configuración no encontrada'
                });
            }

            if (currentConfig.nombre_image && currentConfig.nombre_image !== 'default_image.png') {
                await deleteFile(`uploads/images/${currentConfig.nombre_image}`);
            }

            await configModel.updateImage(userId, file.filename);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                total: 1,
                imagen: {
                    mensaje: 'Imagen actualizada exitosamente',
                    nombreImagen: file.filename
                }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error('Error en updateImage:', error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al actualizar la imagen',
                error: error.message
            });
        }
    },

    updateColors: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const userId = req.params.id;
            const { colors } = req.body;

            if (!colors) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'No se proporcionaron colores'
                });
            }

            const currentConfig = await configModel.findByUserId(userId);
            if (!currentConfig) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(404).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Configuración no encontrada'
                });
            }

            const parsedColors = JSON.parse(colors);
            await configModel.updateColors(userId, parsedColors);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                total: 1,
                colores: parsedColors
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error('Error en updateColors:', error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al actualizar los colores',
                error: error.message
            });
        }
    }
};


module.exports = configController;