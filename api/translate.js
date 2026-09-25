const translate = require('google-translate-api-x');

/**
 * Vercel Serverless Function for translation
 *
 * Endpoint: POST /api/translate
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
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

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

        return res.status(200).json({
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
        return res.status(500).json({
            success: false,
            error: 'Translation failed. Please try again.'
        });
    }
};
