const logger = require('../config/logger');

module.exports = (io) => {
  // Store online users: { userId: socketId }
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // User joins with their ID
    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      logger.info(`User ${userId} is now online`);
      
      // Notify others that this user is online (optional)
      socket.broadcast.emit('user-status', { userId, status: 'online' });
    });

    // Handle Call Offer
    socket.on('call-offer', ({ targetUserId, offer }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', {
          callerId: socket.userId,
          offer
        });
      } else {
        socket.emit('call-error', { message: 'User is offline' });
      }
    });

    // Handle Call Answer
    socket.on('call-answer', ({ targetUserId, answer }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-accepted', {
          callerId: socket.userId,
          answer
        });
      }
    });

    // Handle ICE Candidates
    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', {
          senderId: socket.userId,
          candidate
        });
      }
    });

    // Handle Call End/Reject
    socket.on('end-call', ({ targetUserId }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended', { callerId: socket.userId });
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit('user-status', { userId: socket.userId, status: 'offline' });
      }
    });
  });
};
