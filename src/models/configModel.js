const { pool } = require('../config/database');

const configModel = {
    create: async (userId) => {
        const [result] = await pool.query(
            'INSERT INTO configuracion_usuario (id_usuario) VALUES (?)',
            [userId]
        );
        return result.insertId;
    },

    update: async (userId, config) => {
        await pool.query(
            'UPDATE configuracion_usuario SET nombre_image = ?, nombre_logo = ?, colors = ? WHERE id_usuario = ?',
            [config.nombre_image, config.nombre_logo, JSON.stringify(config.colors), userId]
        );
    },

    updateLogo: async (userId, nombreLogo) => {
        await pool.query(
            'UPDATE configuracion_usuario SET nombre_logo = ? WHERE id_usuario = ?',
            [nombreLogo, userId]
        );
    },

    updateImage: async (userId, nombreImage) => {
        await pool.query(
            'UPDATE configuracion_usuario SET nombre_image = ? WHERE id_usuario = ?',
            [nombreImage, userId]
        );
    },

    updateColors: async (userId, colors) => {
        await pool.query(
            'UPDATE configuracion_usuario SET colors = ? WHERE id_usuario = ?',
            [JSON.stringify(colors), userId]
        );
    },

    findByUserId: async (userId) => {
        const [rows] = await pool.query(
            'SELECT * FROM configuracion_usuario WHERE id_usuario = ?',
            [userId]
        );
        return rows[0];
    }
};

module.exports = configModel;