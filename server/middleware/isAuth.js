const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const err = new Error('Unauthorized access. Please provide valid authentication.');
            err.statusCode = 401;
            throw err;
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, 'supersupersupersecret');
        if (!decodedToken) {
            const err = new Error('Invalid token. Please provide a valid authentication token.');
            err.statusCode = 401;
            throw err;
        }
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        if (!error.statusCode) {
            error.message = 'Invalid token. Please provide a valid authentication token.'
            error.statusCode = 401;
        }
        next(error);
    }
}