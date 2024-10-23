// pages/api/resolve-reddit-url.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { shortUrl } = req.body;

  if (!shortUrl) {
    return res.status(400).json({
      success: false,
      error: 'shortUrl is required'
    });
  }

  // Validate that it's a Reddit short URL
  if (!shortUrl.includes('/s/')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Reddit short URL format. URL must contain "/s/"'
    });
  }

  try {
    // Make request with appropriate headers
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'manual', // Don't automatically follow redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Mode': 'navigate'
      }
    });

    // Check if we got a redirect
    if (response.status === 301 || response.status === 302) {
      const fullUrl = response.headers.get('location');
      
      if (fullUrl) {
        return res.status(200).json({
          success: true,
          shortUrl,
          fullUrl
        });
      }
    }

    // If we didn't get a redirect or location header
    if (response.status === 403) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden. Reddit may be blocking the request.',
        tip: 'Try adding more browser-like headers or using a different User-Agent'
      });
    }

    return res.status(400).json({
      success: false,
      error: `Failed to resolve URL. Status: ${response.status}`,
      shortUrl
    });

  } catch (error) {
    console.error('URL Resolution Error:', {
      timestamp: new Date().toISOString(),
      shortUrl,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to resolve URL',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}