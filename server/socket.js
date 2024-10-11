let io;

exports.init = httpServer => {
    io = require('socket.io')(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type'],
            credentials: true
        }
    });
    return io;
}

exports.getIO = () => {
    if (!io) {
        throw new Error('Socket IO is not initialized.');
    }
    return io;
}