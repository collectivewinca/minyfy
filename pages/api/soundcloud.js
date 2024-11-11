// pages/api/playlist.js
import Soundcloud from 'soundcloud.ts';

// Define response types
// ErrorResponse and PlaylistResponse are removed as TypeScript types are not used in JavaScript

// Initialize SoundCloud client
const soundcloud = new Soundcloud(
  process.env.NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID,
  process.env.NEXT_PUBLIC_SOUNDCLOUD_ACCESS_TOKEN
);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, search } = req.query;

    // Handle playlist search
    if (search && typeof search === 'string') {
      const playlists = await soundcloud.playlists.search({ q: search });
      return res.status(200).json(playlists[0]); // Return first match
    }

    // Handle playlist fetch by URL
    if (url && typeof url === 'string') {
      // Remove 'soundcloud.com' from URL if present
      const cleanUrl = url.replace('https://soundcloud.com/', '');
      const playlist = await soundcloud.playlists.get(cleanUrl);
      return res.status(200).json(playlist);
    }

    return res.status(400).json({ error: 'Missing url or search parameter' });
  } catch (error) {
    console.error('SoundCloud API Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch playlist from SoundCloud'
    });
  }
}
