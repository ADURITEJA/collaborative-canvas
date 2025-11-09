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
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Enable WebSocket transport only
  transports: ['websocket'],
  // Disable HTTP long-polling
  allowEIO3: true
});

// This define the port to run on
const PORT = process.env.PORT || 3000;

// Serve static files from root
app.use(express.static(__dirname));

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// This Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Log all socket events for debugging
  const events = ['DRAW_END', 'UNDO_REQUEST', 'REDO_REQUEST', 'disconnect', 'error'];
  events.forEach(event => {
    socket.on(event, (data) => {
      console.log(`[${event}]`, data || '');
    });
  });

  console.log(`Sending initial state to socket ${socket.id}`);
  const initialState = drawingState.getHistory();
  console.log(`Initial state size: ${JSON.stringify(initialState).length} bytes`);
  
  socket.emit('SET_STATE', initialState);

  socket.on('DRAW_END', (stroke) => {
    console.log(`[DRAW_END] Received stroke from ${socket.id}`, stroke);
    try {
      drawingState.addStroke(stroke);
      console.log(`Broadcasting UPDATE_CANVAS to all clients`);
      io.emit('UPDATE_CANVAS', stroke);
    } catch (error) {
      console.error('Error handling DRAW_END:', error);
    }
  });

  socket.on('UNDO_REQUEST', () => {
    console.log(`[UNDO_REQUEST] from ${socket.id}`);
    try {
      const newHistory = drawingState.undo();
      console.log(`Broadcasting new state after UNDO (${newHistory.length} items)`);
      io.emit('SET_STATE', newHistory);
    } catch (error) {
      console.error('Error handling UNDO_REQUEST:', error);
    }
  });

  socket.on('REDO_REQUEST', () => {
    console.log(`[REDO_REQUEST] from ${socket.id}`);
    try {
      const newHistory = drawingState.redo();
      console.log(`Broadcasting new state after REDO (${newHistory.length} items)`);
      io.emit('SET_STATE', newHistory);
    } catch (error) {
      console.error('Error handling REDO_REQUEST:', error);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id} (${reason})`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
});

// This line Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});