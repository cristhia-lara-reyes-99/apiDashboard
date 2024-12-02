const { pool } = require('../config/database');

const loginAttemptsModel = {
    // Registrar intento de login
    registerAttempt: async (ip, email, success, userAgent) => {
        const query = `
            INSERT INTO login_attempts (
                ip_address, 
                email, 
                success, 
                user_agent, 
                attempt_date
            ) VALUES (?, ?, ?, ?, NOW())
        `;
        return await pool.query(query, [ip, email, success, userAgent]);
    },

    // Obtener intentos fallidos recientes por IP
    getRecentAttemptsByIp: async (ip, minutes = 15) => {
        const query = `
            SELECT COUNT(*) as attempts 
            FROM login_attempts 
            WHERE ip_address = ? 
            AND success = false 
            AND attempt_date > NOW() - INTERVAL ? MINUTE
        `;
        const [result] = await pool.query(query, [ip, minutes]);
        return result[0].attempts;
    },

    // Obtener intentos fallidos por email
    getRecentAttemptsByEmail: async (email, minutes = 15) => {
        const query = `
            SELECT COUNT(*) as attempts 
            FROM login_attempts 
            WHERE email = ? 
            AND success = false 
            AND attempt_date > NOW() - INTERVAL ? MINUTE
        `;
        const [result] = await pool.query(query, [email, minutes]);
        return result[0].attempts;
    },

    // Obtener intentos sospechosos de las últimas 24 horas
    getSuspiciousAttempts: async (minAttempts = 5, hoursAgo = 24) => {
        const query = `
            SELECT 
                ip_address,
                email,
                success,
                user_agent,
                attempt_date,
                COUNT(*) as attempt_count
            FROM login_attempts
            WHERE attempt_date > NOW() - INTERVAL ? HOUR
            GROUP BY ip_address
            HAVING attempt_count > ?
            ORDER BY attempt_count DESC
        `;
        
        const [result] = await pool.query(query, [hoursAgo, minAttempts]);
        return result;
    }
};

module.exports = loginAttemptsModel; 