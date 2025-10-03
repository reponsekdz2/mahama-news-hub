require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware'); // For validating user on WS connection

const app = express();
const server = http.createServer(app);

// --- WebSocket Setup ---
const wss = new WebSocketServer({ noServer: true });
const articleLocks = new Map(); // In-memory store: articleId -> { userId, userName }

wss.on('connection', (ws, req) => {
    // Send initial lock states to the newly connected admin
    ws.send(JSON.stringify({ type: 'initial_locks', payload: Object.fromEntries(articleLocks) }));

    ws.on('message', (message) => {
        try {
            const { type, payload } = JSON.parse(message);
            const { articleId } = payload;
            const { id: userId, name: userName } = ws.user; // User attached during upgrade

            switch(type) {
                case 'start_editing':
                    if (articleLocks.has(articleId) && articleLocks.get(articleId).userId !== userId) {
                        // Conflict: someone else is editing
                         ws.send(JSON.stringify({ type: 'editing_conflict', payload: { articleId, lock: articleLocks.get(articleId) }}));
                    } else {
                        const lockInfo = { userId, userName };
                        articleLocks.set(articleId, lockInfo);
                        broadcast(JSON.stringify({ type: 'start_editing', payload: { articleId, ...lockInfo } }));
                    }
                    break;
                case 'stop_editing':
                     if (articleLocks.has(articleId) && articleLocks.get(articleId).userId === userId) {
                        articleLocks.delete(articleId);
                        broadcast(JSON.stringify({ type: 'stop_editing', payload: { articleId } }));
                    }
                    break;
            }
        } catch (e) {
            console.error('WebSocket message error:', e);
        }
    });

    ws.on('close', () => {
        // When an admin disconnects, release all their locks
        const userId = ws.user.id;
        for (const [articleId, lockInfo] of articleLocks.entries()) {
            if (lockInfo.userId === userId) {
                articleLocks.delete(articleId);
                broadcast(JSON.stringify({ type: 'stop_editing', payload: { articleId } }));
            }
        }
    });
});

const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(data);
        }
    });
};

server.on('upgrade', (request, socket, head) => {
    // Use a mock response object for the middleware
    const res = new http.ServerResponse(request);
    
    // Authenticate user via middleware before upgrading connection
    protect(request, res, () => {
        if (request.user && request.user.role === 'admin') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                ws.user = request.user; // Attach user to WebSocket instance
                wss.emit('connection', ws, request);
            });
        } else {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
        }
    });
});
// --- End WebSocket Setup ---


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
app.use('/api/moderation', require('./routes/moderationRoutes'));
app.use('/', require('./routes/utilityRoutes'));


// Custom Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));