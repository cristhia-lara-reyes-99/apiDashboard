const { clientPool } = require('../config/database');

const clientModel = {
    getAllClients: async () => {
        const [rows] = await clientPool.query('SELECT id, nombre FROM ClientesTAG where activo = 1');
        return rows;
    }
};

module.exports = clientModel;


