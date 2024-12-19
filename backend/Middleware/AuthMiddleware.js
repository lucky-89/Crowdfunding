const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    

    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
        return res.status(401).json({ message: 'Token format is incorrect' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        req.userId = decoded.id; 
        next(); 
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
