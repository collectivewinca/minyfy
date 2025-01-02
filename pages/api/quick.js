import { supabase } from '@/supabase/config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { collectionName, updates } = req.body;

  if (!collectionName || !updates) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Update all records in the collection with the provided updates
    const { error } = await supabase
      .from(collectionName)
      .update(updates);

    if (error) throw error;

    return res.status(200).json({ message: 'Documents updated successfully' });
  } catch (error) {
    console.error('Error updating documents:', error);
    return res.status(500).json({ message: 'Error updating documents', error: error.message });
  }
}
