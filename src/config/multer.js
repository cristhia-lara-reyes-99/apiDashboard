// Importación de módulos necesarios
const multer = require('multer'); // Módulo para manejo de archivos multipart/form-data
const path = require('path');     // Módulo para manejo de rutas de archivos
const fs = require('fs');         // Módulo para operaciones del sistema de archivos

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido'), false);
    }
    cb(null, true);
};
// CHECAR LA EXTENSION DE LOS ARCHIVOS
// TIPO DE ARHCHIVO
// TAMÑO DEL ARCHIVO



// Objeto literal para la configuración de almacenamiento de logos
const logoStorage = {
    // Configuración del almacenamiento usando multer.diskStorage
    storage: multer.diskStorage({
        // Función que determina el directorio donde se guardarán los logos
        destination: (req, file, cb) => {
            const dir = './uploads/logos'; // Define la ruta del directorio
            // Verifica si el directorio existe, si no, lo crea
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir); // Callback con el directorio de destino
        },
        // Función que genera el nombre del archivo
        filename: (req, file, cb) => {
            // Genera un sufijo único combinando timestamp y número aleatorio
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Callback con el nombre final del archivo: 'logo-[timestamp]-[random].[extensión]'
            cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Limite de tamaño: 2MB
};

// Objeto literal para la configuración de almacenamiento de imágenes de perfil
const imageStorage = {
    // Configuración del almacenamiento usando multer.diskStorage
    storage: multer.diskStorage({
        // Función que determina el directorio donde se guardarán las imágenes
        destination: (req, file, cb) => {
            const dir = './uploads/images'; // Define la ruta del directorio
            // Verifica si el directorio existe, si no, lo crea
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir); // Callback con el directorio de destino
        },
        // Función que genera el nombre del archivo
        filename: (req, file, cb) => {
            // Genera un sufijo único combinando timestamp y número aleatorio
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Callback con el nombre final del archivo: 'image-[timestamp]-[random].[extensión]'
            cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Limite de tamaño: 2MB
};

// Creación de los middlewares de multer con las configuraciones respectivas
const uploadLogo = multer(logoStorage);    // Middleware para subida de logos
const uploadImage = multer(imageStorage);   // Middleware para subida de imágenes

// Exportación de los middlewares para su uso en otras partes de la aplicación
module.exports = {
    uploadLogo,
    uploadImage
};