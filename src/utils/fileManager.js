const fs = require('fs').promises;
const path = require('path');

const fileManager = {
    async deleteFile(filePath) {
        try {
            await fs.unlink(path.join(__dirname, '../../', filePath));
            return true;
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            return false;
        }
    },

    getFileUrl(fileName, type) {
        if (!fileName) return null;
        return `/uploads/${type}/${fileName}`;
    }
};

module.exports = fileManager;