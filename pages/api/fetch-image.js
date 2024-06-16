// pages/api/fetch-image.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    const buffer = await imageBlob.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type');

    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
