const express = require('express');
const router = express.Router();
const { generateRssFeed, generateSitemap } = require('../controllers/utilityController');

router.get('/rss.xml', generateRssFeed);
router.get('/sitemap.xml', generateSitemap);

module.exports = router;
