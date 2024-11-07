// pages/api/multiply.js

export default function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Only POST requests are allowed' });
      return;
    }
  
    const { number, times } = req.body;
  
    // Check if `number` and `times` are provided and valid numbers
    if (typeof number !== 'number' || typeof times !== 'number') {
      res.status(400).json({ error: 'Invalid input. Please provide a valid "number" and "times".' });
      return;
    }
  
    // Initialize the result with the initial number
    let result = number*times;
  
    
  
    res.status(200).json({ result });
  }
  