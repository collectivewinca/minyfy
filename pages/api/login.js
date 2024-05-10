import { generateRandomString } from '@/utils/generateRandomString';

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const redirect_uri = 'http://localhost:3000/api/callback';

export default function handler(req, res) {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-read-recently-played';

  const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    }).toString();

  res.redirect(spotifyAuthUrl);
}