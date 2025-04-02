/*
import { Buffer } from 'buffer';
import crypto from 'crypto';
import querystring from 'querystring';

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID; // your clientId
const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString('hex').slice(0, length);
};

const stateKey = 'spotify_auth_state';

const spotifyAuthHandler = async (req, res) => {
  if (req.method === 'GET') {
    if (req.query.action === 'login') {
      const state = generateRandomString(16);
      res.setHeader('Set-Cookie', `${stateKey}=${state}`);
      const scope = 'user-read-private user-read-email';
      res.redirect(
        'https://accounts.spotify.com/authorize?' +
          querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state,
          })
      );
    } else if (req.query.action === 'callback') {
      const code = req.query.code || null;
      const state = req.query.state || null;
      const storedState = req.cookies ? req.cookies[stateKey] : null;
      if (state === null || state !== storedState) {
        res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
      } else {
        res.setHeader('Set-Cookie', `${stateKey}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        const authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
          },
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
          },
          json: true,
        };
        const response = await fetch(authOptions.url, {
          method: 'POST',
          headers: authOptions.headers,
          body: new URLSearchParams(authOptions.form),
        });
        const body = await response.json();
        if (!response.ok) {
          res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
        } else {
          const access_token = body.access_token;
          const refresh_token = body.refresh_token;
          const options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { Authorization: 'Bearer ' + access_token },
            json: true,
          };
          const userResponse = await fetch(options.url, {
            headers: options.headers,
          });
          const userBody = await userResponse.json();
          console.log(userBody);
          res.redirect('/#' + querystring.stringify({ access_token: access_token, refresh_token: refresh_token }));
        }
      }
    } else if (req.query.action === 'refresh_token') {
      const refresh_token = req.query.refresh_token;
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
        },
        json: true,
      };
      const response = await fetch(authOptions.url, {
        method: 'POST',
        headers: authOptions.headers,
        body: new URLSearchParams(authOptions.form),
      });
      const body = await response.json();
      if (response.ok) {
        const access_token = body.access_token;
        const new_refresh_token = body.refresh_token;
        res.status(200).json({ access_token: access_token, refresh_token: new_refresh_token });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default spotifyAuthHandler;
*/
