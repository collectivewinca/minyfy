import { supabase } from '@/supabase/config';

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
    const { data: mixtape, error: fetchError } = await supabase
      .from('mixtapes')
      .select('vimeo')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update the mixtape with new Vimeo data
    const { error: updateError } = await supabase
      .from('mixtapes')
      .update({
        vimeo: vimeoData
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return res.status(200).json({ message: 'Vimeo data updated successfully' });
  } catch (error) {
    console.error('Error updating Vimeo data:', error);
    return res.status(500).json({ message: 'Error updating Vimeo data', error: error.message });
  }
}
