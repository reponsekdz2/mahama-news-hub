const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const webpush = require('web-push');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// VAPID keys should be generated once and stored securely in your .env files
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.error("VAPID keys are not set. Please generate them and add to your .env file.");
} else {
    webpush.setVapidDetails(
      'mailto:admin@mahamanews.com',
      publicVapidKey,
      privateVapidKey
    );
}


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/moderation', require('./routes/moderationRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/push', require('./routes/pushRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Utility routes (RSS, Sitemap)
app.use('/api/utils', require('./routes/utilityRoutes'));


// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));