const { pool } = require('../config/database');

const userModel = {
    findByEmail: async (email) => {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
        return rows[0];
    },

    create: async (userData) => {
        const [result] = await pool.query(
            'INSERT INTO usuarios (id_cliente_tag, correo, contrasena, rol, cliente, nombre, apellido_paterno, apellido_materno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userData.id_cliente_tag, userData.correo, userData.contrasena, userData.rol, userData.cliente, userData.nombre, userData.apellido_paterno, userData.apellido_materno]
        );
        return result.insertId;
    },

    updatePassword: async (id, password) => {
        await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [password, id]);
    },

    updateStatus: async (id, status) => {
        await pool.query('UPDATE usuarios SET estatus = ? WHERE id = ?', [status, id]);
    },

    getAllClients: async () => {
        const [rows] = await pool.query(`
            SELECT id, id_cliente_tag, correo, cliente, nombre, 
                   apellido_paterno, apellido_materno, correo_verified, 
                   estatus, creado, actualizado, ultimo_login 
            FROM usuarios 
            WHERE rol = 1
            ORDER BY creado DESC`);
        return rows;
    },

    getAllUsers: async () => {
        const [rows] = await pool.query(`
            SELECT id, id_cliente_tag, correo, cliente, nombre, 
                   apellido_paterno, apellido_materno, correo_verified, 
                   estatus, creado, actualizado, ultimo_login 
            FROM usuarios 
            ORDER BY rol ASC, creado DESC`);
        return rows;
    },

    getUserRole: async (userId) => {
        const [rows] = await pool.query('SELECT rol FROM usuarios WHERE id = ?', [userId]);
        return rows[0] || null;
    },

    updateLastLogin: async (userId) => {
        await pool.query(
            'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP(3) WHERE id = ?', 
            [userId]
        );
    }
};

module.exports = userModel;
