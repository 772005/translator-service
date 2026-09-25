/**
 * Health check endpoint for Vercel
 *
 * Endpoint: GET /api/health
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    return res.status(200).json({
        status: 'healthy',
        service: 'Translation Service (Vercel)',
        timestamp: new Date().toISOString()
    });
};
