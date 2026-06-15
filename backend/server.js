const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const rateLimit = require('./middleware/rateLimitMiddleware');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security headers via Helmet (#34 — no helmet before)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to load cross-origin
}));

// CORS — restrict to known origins (#4 — was fully open)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim().replace(/\/$/, ''));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Clean origin by removing trailing slash if it exists
    const cleanOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(cleanOrigin)) return callback(null, true);
    
    // Fallback for Vercel preview deployments if needed (optional)
    if (cleanOrigin.endsWith('.vercel.app')) return callback(null, true);
    
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiter for all API routes
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuillSpace API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/comments',
      upload: '/api/upload',
      bookmarks: '/api/bookmarks',
    },
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Error handler - must be last middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
