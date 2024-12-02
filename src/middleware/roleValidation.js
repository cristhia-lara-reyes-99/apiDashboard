const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tiene permisos suficientes' });
        }

        next();
    };
};

module.exports = {
    checkRole
};