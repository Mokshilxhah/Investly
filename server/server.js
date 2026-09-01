require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const startupRoutes = require('./routes/startupRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Startup Investment Intelligence Platform API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/startups', startupRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);

// Serve Frontend in Production (if dist bundle exists)
const fs = require('fs');
const path = require('path');
const distPath = path.resolve(__dirname, '../client/dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(indexHtmlPath);
  });
} else {
  // Backend API mode (when client is hosted on Vercel)
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Investly API Server is running smoothly.',
      frontendApp: 'https://investly-three.vercel.app',
      health: '/api/health',
      endpoints: {
        dashboard: '/api/dashboard',
        startups: '/api/startups',
        pipeline: '/api/startups/pipeline',
      },
    });
  });

  app.get('/favicon.ico', (req, res) => res.status(204).end());
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-bootstrap sample startups if database is currently empty
    try {
      const Startup = require('./models/Startup');
      const { seedStartupsData } = require('./seed/seedData');
      const count = await Startup.countDocuments();
      if (count === 0) {
        console.log('[Auto-Seed] Database is empty. Bootstrapping initial venture startups...');
        await seedStartupsData(false);
      }
    } catch (seedErr) {
      console.warn('[Auto-Seed] Note on auto-seed:', seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
