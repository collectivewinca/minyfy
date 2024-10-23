// pages/api/expand-url.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { shortUrl } = req.body;

  if (!shortUrl) {
    return res.status(400).json({ message: 'shortUrl is required' });
  }

  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 0, // Don't follow the redirects
      validateStatus: function (status) {
        return status >= 300 && status < 400; // Only handle redirects
      }
    });

    const fullUrl = response.headers.location;

    if (fullUrl) {
      res.status(200).json({ fullUrl });
    } else {
      res.status(400).json({ message: 'Failed to expand the URL' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error expanding URL', error: error.message });
  }
}
