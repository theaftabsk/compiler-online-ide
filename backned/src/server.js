const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { executeCode } = require('./sandbox/codeRunner');
const {
  createSession,
  getSession,
  joinSession,
  getSessionLiveGrid,
  endSession
} = require('./controllers/sessionController');
const { setupSocketIO } = require('./sockets/labSocketHandler');

const app = express();
const server = http.createServer(app);

// CORS configuration for frontend web app
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach Socket Handlers
setupSocketIO(io);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Universal Centralized Programming Lab & Practical Monitoring System',
    timestamp: new Date().toISOString()
  });
});

// Session Management Endpoints
app.post('/api/sessions/create', createSession);
app.get('/api/sessions/:code', getSession);
app.post('/api/sessions/join', joinSession);
app.get('/api/sessions/:code/grid', getSessionLiveGrid);
app.post('/api/sessions/:code/end', endSession);

// Code Execution & Testing Endpoint
app.post('/api/code/run', async (req, res) => {
  try {
    const { language = 'c', code = '', input = '', testCases = [], timeLimitMs = 3000 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Source code cannot be empty.' });
    }

    const result = await executeCode({
      language,
      code,
      input,
      testCases,
      timeLimitMs
    });

    res.json(result);
  } catch (error) {
    console.error('Execution Error:', error);
    res.status(500).json({
      success: false,
      verdict: 'INTERNAL_ERROR',
      error: error.message || 'Internal execution engine error'
    });
  }
});

// Default Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Centralized Digital Programming Lab Server is RUNNING`);
  console.log(`📡 REST API & WebSockets Active on Port: http://localhost:${PORT}`);
  console.log(`🏛️ Default Demo Session: BW-AIML-J-26X91 (Brainware Univ, Sec J)`);
  console.log(`=======================================================`);
});
