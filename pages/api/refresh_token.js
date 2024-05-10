import request from 'request';
import { Buffer } from 'buffer';

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

export default function handler(req, res) {
  if (req.method === 'GET') {
    const refresh_token = req.query.refresh_token;

    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;
        res.json({ access_token: access_token, refresh_token: refresh_token });
      } else {
        res.status(response.statusCode).json(body);
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}