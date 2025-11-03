import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

export const teacherOrAdmin = (req, res, next) => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};