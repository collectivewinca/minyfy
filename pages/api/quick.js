import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const url = 'https://go.minyvinyl.com/api/link/list';
    const options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.NEXT_PUBLIC_SINK_KEY}`
      }
    };

    try {
      // Fetch all links with limit 1000
      const response = await fetch(`${url}?limit=1000`, options);
      const data = await response.json();
      
      // Filter and update links containing subwaymusician.xyz
      for (const link of data.links) {
        if (link.url.includes('miny.')) {
          const updatedUrl = link.url.replace('miny.', 'rapidconnect.');
          
          // Call edit API for each matching link
          const editResponse = await fetch('https://go.minyvinyl.com/api/link/edit', {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              'authorization': `Bearer ${process.env.NEXT_PUBLIC_SINK_KEY}`
            },
            body: JSON.stringify({
              slug: link.slug,
              url: updatedUrl
            })
          });
          
          console.log(`Updated ${link.slug}: ${link.url} -> ${updatedUrl}`);
        }
      }
      
      console.log('Update process completed');
      res.status(200).end();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error processing links' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
