import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, vimeoData } = req.body;

  if (!id || !vimeoData) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Get the current mixtape data
    const mixtapeRef = doc(db, 'mixtapes', id);
    const mixtapeDoc = await getDoc(mixtapeRef);

    if (!mixtapeDoc.exists()) {
      throw new Error('Mixtape not found');
    }

    // Update the mixtape with new Vimeo data
    await updateDoc(mixtapeRef, {
      vimeo: vimeoData
    });

    return res.status(200).json({ message: 'Vimeo data updated successfully' });
  } catch (error) {
    console.error('Error updating Vimeo data:', error);
    return res.status(500).json({ message: 'Error updating Vimeo data', error: error.message });
  }
} 