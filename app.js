const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const secretKey = process.env.SECRETKEY;


app.use(bodyParser.json())
app.use(cors())

// Middleware for JWT verification
const verifyJWT = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
};

// Attach the middleware to WebSocket connections
io.use(verifyJWT);

// Store user sessions to enforce single device login
const activeSessions = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id;

  // Check if the user has an active session
  if (activeSessions.has(userId)) {
    const oldSocketId = activeSessions.get(userId);
    io.to(oldSocketId).emit('forceLogout', 'Logged in on another device');
    io.sockets.sockets.get(oldSocketId)?.disconnect();
  }

  activeSessions.set(userId, socket.id);

  console.log('New connection from user:', userId);

  socket.on('message', (data) => {
    console.log('Message from user:', data);

    // Broadcast the message to a specific room or namespace
    io.to('some_room').emit('broadcastMessage', { user: userId, message: data });
  });

  // Disconnect event handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', userId);
    activeSessions.delete(userId); // Remove user from active sessions
  });
});


require('./app/routes/auth')(app)

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
