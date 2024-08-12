import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { docId, customUrl } = req.body;
    console.log(docId, customUrl);
    const url = 'https://api.short.io/links';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: process.env.NEXT_PUBLIC_SHORT_IO_KEY
      },
      body: JSON.stringify({
        domain: 'go.minyvinyl.com',
        // cloaking: true,
        originalURL: `https://minyfy.subwaymusician.xyz/play/${docId}`,
        title: 'Minyfy',
        ...(customUrl && { path: customUrl })
      })
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error creating short URL' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
