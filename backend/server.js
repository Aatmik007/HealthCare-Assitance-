const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const vitalsRoutes = require('./routes/vitals');
const reportsRoutes = require('./routes/reports');
const symptomsRoutes = require('./routes/symptoms');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Bind routes
app.use('/api/auth', authRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const { getDbMode } = require('./config/db');
  res.json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    databaseMode: getDbMode()
  });
});

// Serve frontend assets in production (if requested)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
const startServer = async () => {
  // Connect to DB (with automatic fallback to JSON files)
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🩺 Aura Health Express Server running on port ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================`);
  });
};

startServer();
