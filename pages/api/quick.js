// pages/api/uploadData.js
import fs from 'fs';
import path from 'path';
import { db } from '@/firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const jsonFilePath = path.join(process.cwd(), 'extra', 'data.json');
    
    try {
      const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      
      const mixtapesCollection = collection(db, 'mixtapes');
      
      const promises = data.map(item => {
        const docRef = doc(mixtapesCollection, item.id);
        return setDoc(docRef, item);
      });
      
      await Promise.all(promises);
      
      res.status(200).json({ message: 'Data uploaded successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload data', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}