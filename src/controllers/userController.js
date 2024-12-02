const userModel = require('../models/userModel');
const configModel = require('../models/configModel');
const { hashPassword } = require('../utils/passwords');
const { clientPool } = require('../config/database');
const validator = require('validator');

const userController = {

    createUserCliente: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const {
                id_cliente_tag,
                correo,
                contrasena,
                cliente,
                nombre,
                apellido_paterno,
                apellido_materno
            } = req.body;

            // Validar campos requeridos
            if (!id_cliente_tag || !correo || !contrasena || !cliente ||
                !nombre || !apellido_paterno || !apellido_materno) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Todos los campos son obligatorios',
                    error: 'MISSING_REQUIRED_FIELDS'
                });
            }

            // Validar formato del correo
            if (!validator.isEmail(correo)) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Formato de correo inválido',
                    error: 'INVALID_EMAIL_FORMAT'
                });
            }

            // Validar longitud de la contraseña
            if (!validator.isLength(contrasena, { min: 6 })) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                    error: 'INVALID_PASSWORD_LENGTH'
                });
            }

            // Validar longitud de otros campos
            if (!validator.isLength(nombre, { min: 1 }) ||
                !validator.isLength(apellido_paterno, { min: 1 }) ||
                !validator.isLength(apellido_materno, { min: 1 })) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Nombre y apellidos no pueden estar vacíos',
                    error: 'INVALID_NAME_LENGTH'
                });
            }

            // Verificar si el correo ya existe
            const existingUser = await userModel.findByEmail(correo);
            if (existingUser) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'El correo ya está registrado',
                    error: 'EMAIL_ALREADY_EXISTS'
                });
            }

            const hashedPassword = await hashPassword(contrasena);

            // Crear usuario con rol = 1 (cliente)
            const userId = await userModel.create({
                id_cliente_tag,
                correo,
                contrasena: hashedPassword,
                rol: 1, // Rol cliente
                cliente,
                nombre,
                apellido_paterno,
                apellido_materno
            });

            // Crear configuración por defecto
            await configModel.create(userId);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.status(201).json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Usuario creado exitosamente',
                usuario: {
                    id: userId,
                    correo,
                    cliente,
                    nombre: `${nombre} ${apellido_paterno} ${apellido_materno}`,
                    createdBy: {
                        userId: req.user.id,
                        userRole: req.user.rol
                    }
                }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    },



    createUserAdmin: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const {
                correo,
                contrasena,
                nombre,
                apellido_paterno,
                apellido_materno
            } = req.body;

            // Validar campos requeridos
            if (!correo || !contrasena || !nombre ||
                !apellido_paterno || !apellido_materno) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Todos los campos son obligatorios',
                    error: 'MISSING_REQUIRED_FIELDS'
                });
            }

            // Validar formato del correo
            if (!validator.isEmail(correo)) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Formato de correo inválido',
                    error: 'INVALID_EMAIL_FORMAT'
                });
            }

            // Validar longitud de la contraseña
            if (!validator.isLength(contrasena, { min: 6 })) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                    error: 'INVALID_PASSWORD_LENGTH'
                });
            }

            // Verificar si el correo ya existe
            const existingUser = await userModel.findByEmail(correo);
            if (existingUser) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'El correo ya está registrado',
                    error: 'EMAIL_ALREADY_EXISTS'
                });
            }

            const hashedPassword = await hashPassword(contrasena);

            // Crear usuario con rol = 2 (admin)
            const userId = await userModel.create({
                correo,
                contrasena: hashedPassword,
                rol: 2, // Rol admin
                nombre,
                apellido_paterno,
                apellido_materno
            });

            // Crear configuración por defecto
            await configModel.create(userId);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.status(201).json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Administrador creado exitosamente',
                usuario: {
                    id: userId,
                    correo,
                    cliente: null,
                    nombre: `${nombre} ${apellido_paterno} ${apellido_materno}`,
                    createdBy: {
                        userId: req.user.id,
                        userRole: req.user.rol
                    }
                }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al crear administrador',
                error: error.message
            });
        }
    },

    createUserRoot: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const {
                correo,
                contrasena,
                nombre,
                apellido_paterno,
                apellido_materno
            } = req.body;

            // Validar campos requeridos
            if (!correo || !contrasena || !nombre ||
                !apellido_paterno || !apellido_materno) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Todos los campos son obligatorios',
                    error: 'MISSING_REQUIRED_FIELDS'
                });
            }

            // Validar formato del correo
            if (!validator.isEmail(correo)) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Formato de correo inválido',
                    error: 'INVALID_EMAIL_FORMAT'
                });
            }

            // Validar longitud de la contraseña
            if (!validator.isLength(contrasena, { min: 6 })) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                    error: 'INVALID_PASSWORD_LENGTH'
                });
            }

            // Verificar si el correo ya existe
            const existingUser = await userModel.findByEmail(correo);
            if (existingUser) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'El correo ya está registrado',
                    error: 'EMAIL_ALREADY_EXISTS'
                });
            }

            const hashedPassword = await hashPassword(contrasena);

            // Crear usuario con rol = 3 (root)
            const userId = await userModel.create({
                correo,
                contrasena: hashedPassword,
                rol: 3, // Rol root
                nombre,
                apellido_paterno,
                apellido_materno
            });

            // Crear configuración por defecto
            await configModel.create(userId);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.status(201).json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Usuario root creado exitosamente',
                usuario: {
                    id: userId,
                    correo,
                    cliente: null,
                    nombre: `${nombre} ${apellido_paterno} ${apellido_materno}`,
                    createdBy: {
                        userId: req.user.id,
                        userRole: req.user.rol
                    }
                }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al crear usuario root',
                error: error.message
            });
        }
    },

    updateUserStatus: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const { id } = req.params;
            const { estatus } = req.body;

            // Validar que el estatus esté presente y sea válido (0 o 1)
            if (estatus === undefined || ![0, 1].includes(Number(estatus))) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(400).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'El estatus es requerido y debe ser true o false',
                    error: 'INVALID_STATUS'
                });
            }

            // Verificar si el usuario existe
            const userExists = await userModel.getUserRole(id);
            if (!userExists) {
                const endTime = process.hrtime(startTime);
                const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
                return res.status(404).json({
                    success: false,
                    tiempoRespuesta: `${responseTime}ms`,
                    message: 'Usuario no encontrado',
                    error: 'USER_NOT_FOUND'
                });
            }

            await userModel.updateStatus(id, estatus);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Estatus actualizado exitosamente',
                usuario: {
                    id,
                    estatus
                }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al actualizar estatus',
                error: error.message
            });
        }
    },

    updatePassword: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const { id } = req.params;
            const { contrasena } = req.body;

            const hashedPassword = await hashPassword(contrasena);
            await userModel.updatePassword(id, hashedPassword);

            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            res.json({
                success: true,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Contraseña actualizada exitosamente',
                usuario: { id }
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al actualizar contraseña',
                error: error.message
            });
        }
    },

    getClients: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const clients = await userModel.getAllClients();
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            const transformedClients = clients.map(client => ({
                id: client.id,
                idClienteTag: client.id_cliente_tag,
                correo: client.correo,
                cliente: client.cliente,
                nombre: client.nombre,
                apellidoPaterno: client.apellido_paterno,
                apellidoMaterno: client.apellido_materno,
                estatus: client.estatus,
                fechaCreacion: client.creado,
                ultimoAcceso: client.ultimo_login
            }));

            res.json({
                success: true,
                total: clients.length,
                tiempoRespuesta: `${responseTime}ms`,
                clientes: transformedClients
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al obtener los clientes',
                error: error.message
            });
        }
    },

    getAllUsers: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const users = await userModel.getAllUsers();
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

            const transformedUsers = users.map(user => ({
                id: user.id,
                idClienteTag: user.id_cliente_tag,
                correo: user.correo,
                cliente: user.cliente,
                nombre: client.nombre,
                apellidoPaterno: client.apellido_paterno,
                apellidoMaterno: client.apellido_materno,
                estatus: user.estatus,
                fechaCreacion: user.creado,
                ultimoAcceso: user.ultimo_login
            }));

            res.json({
                success: true,
                total: users.length,
                tiempoRespuesta: `${responseTime}ms`,
                usuarios: transformedUsers
            });
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            console.error(error);
            res.status(500).json({
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al obtener los usuarios',
                error: error.message
            });
        }
    }

};

module.exports = userController;

