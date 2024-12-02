const clientModel = require('../models/clientModel');

const clientController = {
    getAllClients: async (req, res) => {
        const startTime = process.hrtime();
        try {
            const rows = await clientModel.getAllClients();
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2); // Convertir a milisegundos

            const response = {
                success: true,
                total: rows.length,
                tiempoRespuesta: `${responseTime}ms`,
                clientes: rows.map(client => ({
                    id: client.id,
                    nombre: client.nombre,
                    nombreNormalizado: client.nombre.toLowerCase().replace(/\s+/g, '_')
                }))
            };
            res.json(response);
        } catch (error) {
            const endTime = process.hrtime(startTime);
            const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
            
            console.error(error);
            res.status(500).json({ 
                success: false,
                tiempoRespuesta: `${responseTime}ms`,
                message: 'Error al obtener clientes',
                error: error.message 
            });
        }
    }
};

module.exports = clientController;
