const db = require('../config/db');

const generateRssFeed = async (req, res, next) => {
    try {
        const [articles] = await db.query(`
            SELECT id, title, summary, createdAt 
            FROM articles 
            WHERE status = 'published' 
            ORDER BY createdAt DESC 
            LIMIT 20
        `);
        
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

        const feedItems = articles.map(article => {
            const url = `${baseUrl}/article/${article.id}`;
            return `
                <item>
                    <title><![CDATA[${article.title}]]></title>
                    <link>${url}</link>
                    <guid>${url}</guid>
                    <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
                    <description><![CDATA[${article.summary}]]></description>
                </item>
            `;
        }).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8" ?>
            <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
                <channel>
                    <title>Mahama News TV</title>
                    <link>${baseUrl}</link>
                    <description>Latest news from Mahama News TV</description>
                    <language>en-us</language>
                    <lastBuildDate>${new Date(articles[0]?.createdAt || Date.now()).toUTCString()}</lastBuildDate>
                    <atom:link href="${baseUrl}/api/utils/rss.xml" rel="self" type="application/rss+xml" />
                    ${feedItems}
                </channel>
            </rss>
        `;

        res.type('application/xml');
        res.send(rss);

    } catch (error) {
        next(error);
    }
};

const generateSitemap = async (req, res, next) => {
     try {
        const [articles] = await db.query(`
            SELECT id, updatedAt FROM articles WHERE status = 'published' ORDER BY updatedAt DESC
        `);
        
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

        const urlEntries = articles.map(article => {
            const url = `${baseUrl}/article/${article.id}`;
            const lastMod = new Date(article.updatedAt).toISOString();
            return `
                <url>
                    <loc>${url}</loc>
                    <lastmod>${lastMod}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
            `;
        }).join('');
        
        // Add home page URL
        const homeUrl = `
            <url>
                <loc>${baseUrl}/</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>daily</changefreq>
                <priority>1.0</priority>
            </url>
        `;

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${homeUrl}
                ${urlEntries}
            </urlset>
        `;

        res.type('application/xml');
        res.send(sitemap);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateRssFeed,
    generateSitemap,
};