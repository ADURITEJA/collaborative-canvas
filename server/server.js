const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const drawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);

// Configure CORS for Vercel deployment
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

//  This define the port to run on 3000
const PORT = process.env.PORT || 3000;

// Serve static files from client directory
const clientPath = path.join(__dirname, '..', 'client');

// In production, serve static files through Vercel's static hosting
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(clientPath));
  app.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// This Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  console.log(`SERVER: Emitting 'SET_STATE' to socket ${socket.id}`);

  socket.emit('SET_STATE', drawingState.getHistory());

  socket.on('DRAW_END', (stroke) => {
    // This Add the stroke to our history
    drawingState.addStroke(stroke);
    
    // This Broadcast this new stroke to ALL clients (including sender)
    // This ensures everyone's state is in sync
    io.emit('UPDATE_CANVAS', stroke);
  });

  // This Handle Undo operation
  socket.on('UNDO_REQUEST', () => {
    const newHistory = drawingState.undo();
    // Broadcast the *entire new state* to all clients
    io.emit('SET_STATE', newHistory);
  });

  // This Handle Redo operation
  socket.on('REDO_REQUEST', () => {
    const newHistory = drawingState.redo();
    // This Broadcast the entire new state to all clients
    io.emit('SET_STATE', newHistory);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// This line Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});