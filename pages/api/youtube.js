import { google } from 'googleapis';
import fetch from 'node-fetch';

const getFirstVideoId = async (query) => {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(searchUrl);
    const html = await response.text();

    const videoIdMatch = html.match(/"videoRenderer":{[^}]*?"videoId":"([^"]+)"/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    console.log('First Video ID of', query, ':', videoId);
    return videoId;
  } catch (error) {
    console.error('Error fetching the URL:', error);
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const videoId = await getFirstVideoId(query);

    if (!videoId) {
      return res.status(404).json({ error: 'No videos found' });
    }

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });

    const videoResponse = await youtube.videos.list({
      part: 'snippet',
      id: videoId,
    });

    if (videoResponse.data.items.length === 0) {
      return res.status(404).json({ error: 'Video details not found' });
    }

    const videoDetails = videoResponse.data.items.map(item => ({
      videoId: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnails: item.snippet.thumbnails,
      description: item.snippet.description,
    }));

    return res.status(200).json(videoDetails);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
