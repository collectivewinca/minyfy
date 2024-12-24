import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { docId, customUrl } = req.body;
    console.log(docId, customUrl);
    const url = 'https://go.minyvinyl.com/api/link/create';
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.NEXT_PUBLIC_SINK_KEY}`
      },
      body: JSON.stringify({
        url: `https://minyfy.minyvinyl.com/exclusive/${docId}`,
        ...(customUrl && { slug: customUrl })
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
