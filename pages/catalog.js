import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase/config';
import Header from '@/components/Header';
import Image from 'next/image';
import { FaRegHeart, FaHeart, FaSearch, FaRegComment } from 'react-icons/fa';
import { MdModeEdit } from 'react-icons/md';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { FaComment } from 'react-icons/fa';
import { IoCaretUpSharp } from 'react-icons/io5';
import TagsComponent from '@/components/TagsComponent';

const BATCH_SIZE = 12;

export default function Catalog() {
  const [mixtapes, setMixtapes] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('Latest');
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab !== 'Tags') {
      setMixtapes([]);
      setLastDoc(null);
      setHasMore(true);
      fetchMixtapes();
    }
  }, [activeTab]);

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

  const handleUpvote = async (mixtapeId) => {
    if (!user) {
      handleLogin();
      return;
    }

    try {
      // First get the current mixtape
      const { data: mixtape, error: fetchError } = await supabase
        .from('mixtapes')
        .select('vote_count')
        .eq('id', mixtapeId)
        .single();

      if (fetchError) throw fetchError;

      // Update the vote count
      const { error: updateError } = await supabase
        .from('mixtapes')
        .update({ vote_count: (mixtape.vote_count || 0) + 1 })
        .eq('id', mixtapeId);

      if (updateError) throw updateError;

      // Update local state
      setMixtapes(prevMixtapes =>
        prevMixtapes.map(m =>
          m.id === mixtapeId
            ? { ...m, vote_count: (m.vote_count || 0) + 1 }
            : m
        )
      );
    } catch (error) {
      console.error('Error updating vote count: ', error);
    }
  };

  const fetchMixtapes = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let query = supabase
        .from('mixtapes')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'popular') {
        query = query.order('vote_count', { ascending: false });
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data: newMixtapes, error } = await query
        .range(mixtapes.length, mixtapes.length + BATCH_SIZE - 1);

      if (error) throw error;

      setMixtapes(prevMixtapes => 
        mixtapes.length === 0 ? newMixtapes : [...prevMixtapes, ...newMixtapes]
      );
      setHasMore(newMixtapes.length === BATCH_SIZE);
    } catch (error) {
      console.error('Error fetching mixtapes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMixtapesBySearch = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setIsSearching(true);
    try {
      const { data: searchResults, error } = await supabase
        .from('mixtapes')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(BATCH_SIZE);

      if (error) throw error;

      setMixtapes(searchResults);
      setHasMore(false); // Disable infinite scroll for search results
    } catch (error) {
      console.error('Error searching mixtapes:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, searchQuery]);

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setIsSearching(false);
      setSearchResults([]);
      setActiveTab('Latest');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      fetchMixtapesBySearch();
    } else {
      setIsSearching(false);
      setSearchResults([]);
      setActiveTab('Latest');
    }
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 &&
      !isSearching &&
      !loading &&
      hasMore &&
      activeTab !== 'Tags'
    ) {
      fetchMixtapes();
    }
  }, [fetchMixtapes, isSearching, loading, hasMore, activeTab]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const displayedMixtapes = isSearching ? searchResults : mixtapes;

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setIsSearching(false);
    setSearchResults([]);
    setMixtapes([]);
    setLastDoc(null);
    setHasMore(true);
  };

  const renderMixtapeCard = (mixtape) => (
    <div className="relative group">
      <Link href={mixtape.shortened_link || `/play/${mixtape.id}`}>
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={mixtape.image_url}
            alt={mixtape.name}
            width={300}
            height={300}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            quality={75}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="font-bold text-lg">{mixtape.name}</p>
              <p className="text-sm">by {mixtape.user_display_name}</p>
              <div className="mt-2 flex items-center justify-center space-x-4">
                <span className="flex items-center">
                  <FaHeart className="mr-1" /> {mixtape.vote_count || 0}
                </span>
                <span className="flex items-center">
                  <FaComment className="mr-1" /> {mixtape.comment_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <>
    <NextSeo
      title="Mixtape Catalog - Discover Trending Music Playlists | Miny Vinyl"
      description="Explore the Miny Vinyl mixtape / playlist gallery(Catalog)! Discover new music and trending playlists, filter by upvotes, comments, or tags like Halloween, ACL Festival and many more. Find your next sonic obsession. Also Suppurt your favorite mixtapes by upvoting them!"
      canonical="https://minyfy.minyvinyl.com/catalog" 
      openGraph={{
        url: 'https://minyfy.minyvinyl.com/catalog',
        title: 'Dive into the Miny Vinyl Mixtape Catalog! 🔥 Discover Trending Playlists Now!',
        description:
          "Explore a world of curated music! Discover new playlists, filter by trending tags, or see what's hot in the Miny Vinyl community. Your next favorite song awaits!",
        images: [
          {
            url: 'https://minyfy.minyvinyl.com/vinyl.png', 
            width: 1200,
            height: 630,
            alt: 'Miny Vinyl - Explore the Mixtape Catalog', 
          },
        ],
        site_name: 'Miny Vinyl',
      }}
      twitter={{
        handle: '@minyvinyl',
        site: '@minyvinyl',
        cardType: 'summary_large_image',
        title:
          'Discover Your Next Music Obsession in the Miny Vinyl Catalog! 🎧',
        description:
          'Trending mixtapes, curated playlists, and more! Explore the Miny Vinyl gallery and find your new soundtrack. #MINY #mixtape #musicdiscovery #playlists',
      }}
      additionalJsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Mixtape Catalog - Discover Trending Music Playlists',
          description: "Explore the Miny Vinyl mixtape / playlist gallery(Catalog)! Discover new music and trending playlists, filter by upvotes, comments, or tags like Halloween, ACL Festival and many more. Find your next sonic obsession. Also Suppurt your favorite mixtapes by upvoting them!",
          url: 'https://minyfy.minyvinyl.com/catalog',
        },
      ]}
    />
    <div className="min-h-screen">
      <Header />
      <div className="w-full font-jakarta mx-auto pb-8">
        {/* Search Bar and Filter Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mx-2 mb-8 mt-2 space-y-4 sm:space-y-0">
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {['Tags', 'Latest', 'Most Upvotes', 'Most Comments'].map((tab) => (
          <button 
            key={tab}
            className={`bg-gray-200 rounded-full hover:bg-gray-400 py-1 px-3 text-sm ${activeTab === tab ? 'bg-gray-900 text-white' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex items-center w-full sm:w-auto sm:max-w-xs">
        <input 
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search mixtapes..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#000000] h-10"
        />
        <button 
          onClick={handleSearch}
          className="py-1 px-2 bg-[#000000] text-white rounded-r-md focus:outline-none hover:bg-[#6aa43c] h-10"
        >
          <FaSearch className="text-lg" />
        </button>
      </div>
    </div>

        {/* Conditionally Render Tags or Mixtapes */}
        {activeTab === 'Tags' && !isSearching ? (
          <TagsComponent />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-3 gap-5">
            {displayedMixtapes.map((mixtape, index) => (
              <div key={`${mixtape.id}-${index}`} className="relative flex flex-col items-center justify-center">
                <Image
                  alt={mixtape.name}
                  className="w-full rounded object-cover cursor-pointer hover:scale-95"
                  onClick={() => {router.push(`/play/${mixtape.id}`)}}
                  src={mixtape.image_url}
                  width={300}
                  height={300}
                  quality={75}
                />
                <h2 className="text-base text-center font-medium mt-1">{toSentenceCase(mixtape.name)}</h2>
                <div className="flex gap-1 mb-2 text-slate-600 hover:text-primary items-center cursor-pointer">
                  <FaRegComment className="text-base leading-none" />
                  <div className="text-xs leading-none">
                    {mixtape.comment_count || 0} Comments
                  </div>
                </div>

                <div
                  className={`flex flex-col absolute top-0 right-0 justify-center items-center border pb-1 rounded-sm px-2 cursor-pointer hover:border-[#78bf45] shadow-md hover:shadow-[#78bf45] ${voted[mixtape.id] ? 'border-[#78bf45] text-[#78bf45]' : 'border-gray-300 text-slate-600'}`}
                  onClick={() => handleUpvote(mixtape.id)} 
                >
                  <IoCaretUpSharp className={`text-base leading-none ${voted[mixtape.id] ? 'text-[#78bf45]' : 'text-slate-600'}`} />
                  <div className="text-[0.6rem] -mt-[1px] leading-none">{mixtape.vote_count || 0}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mb-2">
            <div className="relative">
              <div className="h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-gray-600"></div>
              <div className="absolute top-0 left-0 h-8 md:h-12 w-8 md:w-12 rounded-full border-t-4 border-b-4 border-[#78bf45] animate-spin"></div>
            </div>
          </div>
        )}

        {isSearching && searchResults.length === 0 && !loading && (
          <p className="text-center font-medium font-jakarta mt-4">No results found for "{searchQuery}"</p>
        )}

        {!isSearching && !hasMore && mixtapes.length > 0 && (
          <p className="text-center font-medium font-jakarta mt-4">END</p>
        )}
      </div>
    </div>
    </>
    
  );
}