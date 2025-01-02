import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { supabase } from '@/supabase/config';

export default function TagsComponent() {
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchTags();

    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error.message);
        return;
      }
      setUser(session?.user || null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    checkUser();
    return () => subscription?.unsubscribe();
  }, []);

  const fetchTags = async () => {
    try {
      const { data: fetchedTags, error } = await supabase
        .from('tags')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;
      setTags(fetchedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const handleGoBack = () => {
    setSelectedTag(null);
  };

  const toSentenceCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  if (selectedTag) {
    return (
      <div className="px-4 pb-8">
        <div className='flex gap-1 md:justify-between justify-center flex-col md:flex-row items-center '>
        <h2 className="text-3xl text-center md:text-left font-semibold mb-4">{toSentenceCase(selectedTag.tag_name)}</h2>
        <div
          onClick={handleGoBack}
          className="mb-4 px-3 py-2 cursor-pointer flex items-center font-semibold gap-1 border-[2.3px] border-black rounded hover:bg-lime-400"
        >
          <FaRegArrowAltCircleLeft className='text-xl'/> Back
        </div>
        </div>
        
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-3 gap-5">
          {(selectedTag.selected_mixtapes || []).map((mixtape, index) => (
            <div key={`${mixtape.id}-${index}`} className="relative flex flex-col items-center justify-center">
              <div className="w-full">
              <Image
                 alt={mixtape.name}
                 className="w-full rounded object-cover cursor-pointer hover:scale-95"
                 onClick={() => {router.push(`/play/${mixtape.id}`)}}
                 src={mixtape.image_url}
                 width={300}
                 height={300}
                 quality={75}
               />
              </div>
              <h2 className="text-lg text-center font-medium mt-1">{toSentenceCase(mixtape.name)}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8">
      <div className="grid grid-cols-1 font-jakarta sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="cursor-pointer transition-transform"
            onClick={() => handleTagClick(tag)}
          >
            <div className="relative hover:scale-[1.05] transition-transform">
              <div className="overlay1"></div>
              <div className="w-full aspect-square relative">
                <Image 
                  alt={tag.tag_name}
                  className="h-full w-full rounded-xl object-cover"
                  src={tag.tag_image_url}
                  width={100}
                  height={100}
                  quality={86}
                />
              </div>
              <div className="cardContent">
                <p className="text-white text-base font-medium tracking-wide absolute bottom-0 left-0 px-2 py-2 z-40">{toSentenceCase(tag.tag_name)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}