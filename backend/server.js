const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

connectDB();

const app = express();

const configuredFrontendOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const railwayOrigin = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : null;

const allowedOrigins = [
  ...configuredFrontendOrigins,
  ...(railwayOrigin ? [railwayOrigin] : []),
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Apply CORS to API routes only. Static frontend assets should not be CORS-gated.
app.use('/api', cors(corsOptions));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);

// Serve frontend
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
console.log('Static files path:', frontendDist);
app.use(express.static(frontendDist));

// All other routes serve index.html
app.use((req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});