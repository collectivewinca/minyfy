// pages/api/resolve-reddit-url.js
import axios from 'axios';

const MAX_REDIRECTS = 5;
const TIMEOUT = 5000; // 5 seconds

// Helper function to validate URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to safely log errors
const logError = (error, shortUrl) => {
  console.error('URL Resolution Error:', {
    timestamp: new Date().toISOString(),
    shortUrl,
    errorMessage: error.message,
    errorCode: error.code,
    errorResponse: error.response?.status,
    stack: error.stack
  });
};

export default async function handler(req, res) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  const { shortUrl } = req.body;

  // Validate input
  if (!shortUrl) {
    return res.status(400).json({
      success: false,
      error: 'shortUrl is required'
    });
  }

  if (!isValidUrl(shortUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid URL format'
    });
  }

  try {
    // Configure axios with more robust settings
    const response = await axios.get(shortUrl, {
      maxRedirects: 0,
      timeout: TIMEOUT,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLResolver/1.0)',
        'Accept': '*/*'
      }
    });

    // Handle different response scenarios
    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      // Got a redirect - return the full URL
      return res.status(200).json({
        success: true,
        fullUrl: response.headers.location,
        statusCode: response.status
      });
    } else if (response.status === 200) {
      // No redirect - URL is already expanded
      return res.status(200).json({
        success: true,
        fullUrl: shortUrl,
        statusCode: 200,
        note: 'URL is already in its expanded form'
      });
    }

    // Unexpected response
    throw new Error(`Unexpected response status: ${response.status}`);

  } catch (error) {
    // Log the error for debugging
    logError(error, shortUrl);

    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        details: 'Connection refused'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        details: 'The request took too long to complete'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
        details: 'The requested URL does not exist'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to resolve URL',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}