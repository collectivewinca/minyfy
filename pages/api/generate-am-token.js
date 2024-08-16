import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
    const teamId = '58MY7KU4ZR'; // Replace with your Team ID
    const keyId = 'P6LLW8W3J3';

    if (!privateKey || !teamId || !keyId) {
      throw new Error('Environment variables are not set properly.');
    }

    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: teamId,
      header: {
        alg: 'ES256',
        kid: keyId,
      },
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
}
