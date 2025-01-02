import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/config';
import Head from 'next/head';

export default function VimeoPage() {
  const [vimeoData, setVimeoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVimeoData() {
      try {
        const { data, error } = await supabase
          .from('mixtapes')
          .select('id, vimeo')
          .not('vimeo', 'is', null);

        if (error) throw error;
        setVimeoData(data);
      } catch (error) {
        console.error('Error fetching Vimeo data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVimeoData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Vimeo Content | Minyfy</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Vimeo Content</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vimeoData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.vimeo && (
                <div 
                  className="relative pb-[56.25%] h-0"
                  dangerouslySetInnerHTML={{ 
                    __html: item.vimeo 
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
