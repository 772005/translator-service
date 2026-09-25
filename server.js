const express = require('express');
const cors = require('cors');
require('dotenv').config();
const translate = require('google-translate-api-x');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Translation Service',
        port: PORT
    });
});

/**
 * Translate Indian language text to English
 *
 * POST /translate
 *
 * Request body:
 * {
 *   "text": "मुझे आज काम पर जाना है।"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "original_text": "मुझे आज काम पर जाना है।",
 *   "english_text": "I have to go to work today."
 * }
 */
app.post('/translate', async (req, res) => {
    try {
        const { text } = req.body;

        // Validate input
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        if (typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Text must be a string'
            });
        }

        if (text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text cannot be empty'
            });
        }

        console.log(`Translating text: ${text.substring(0, 100)}...`);

        // Translate to English
        const result = await translate(text, { to: 'en' });

        const englishText = result.text;

        console.log(`Translation successful: ${englishText.substring(0, 100)}...`);

        res.json({
            success: true,
            original_text: text,
            english_text: englishText
        });

    } catch (error) {
        console.error('Translation error:', error.message);

        // Handle specific translation errors
        if (error.code === 'ERR_NETWORK' || error.message.includes('ENOTFOUND')) {
            return res.status(503).json({
                success: false,
                error: 'Translation service temporarily unavailable'
            });
        }

        if (error.message.includes('429') || error.message.includes('too many')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        // Generic error response
        res.status(500).json({
            success: false,
            error: 'Translation failed. Please try again.'
        });
    }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('=' .repeat(50));
    console.log('Translation Service Started');
    console.log('=' .repeat(50));
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Translate endpoint: POST http://localhost:${PORT}/translate`);
    console.log('=' .repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
