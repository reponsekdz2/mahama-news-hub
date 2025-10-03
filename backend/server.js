require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies

// Serve static files for uploaded images/videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/', require('./routes/utilityRoutes'));


// Custom Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));