/**
 * Knowledge Animation Platform - Backend (Node.js)
 * Main server entry point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const animationRoutes = require('./routes/animations');
const projectRoutes = require('./routes/projects');
const renderRoutes = require('./routes/render');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve rendered videos statically
app.use('/output', express.static(path.join(__dirname, 'output', 'media', 'videos')));

// Routes
app.use('/api', animationRoutes);
app.use('/api', projectRoutes);
app.use('/api', renderRoutes);
app.use('/api', aiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Knowledge Animation Platform API', 
    status: 'running',
    version: '0.1.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;