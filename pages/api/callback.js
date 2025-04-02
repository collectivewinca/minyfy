/*
import axios from 'axios';

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID; // your clientId
const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = 'http://localhost:3000/api/callback'; 

async function getProfile(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });
  const data = await response.json();
  console.log(data); // Log the user's profile data
}

export default async function handler(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
  } else {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      }), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        },
      });

      const { access_token, token_type, scope, expires_in, refresh_token } = response.data;

    //   await getProfile(access_token);
      

      res.redirect('/#' + new URLSearchParams({ access_token: access_token }).toString());
    } catch (error) {
      res.redirect('/#' + new URLSearchParams({ error: 'invalid_token' }).toString());
    }
  }
}
*/
