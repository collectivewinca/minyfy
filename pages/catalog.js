import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/Header';
import { IoCaretUpSharp } from 'react-icons/io5';
import Image from 'next/image';
import { FaRegComment, FaSearch } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import TagsComponent from '@/components/TagsComponent';

const BATCH_SIZE = 20;

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
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
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleUpvote = async (mixtapeId) => {
    if (!user) {
      handleLogin();
      return;
    }

    const mixtape = mixtapes.find(m => m.id === mixtapeId);
    const hasVotedToday = mixtape.votedBy?.some(vote =>
      vote.userId === user.uid &&
      vote.date.toDate().toDateString() === new Date().toDateString()
    );

    if (hasVotedToday) {
      alert("You've already voted today!");
      return;
    }

    try {
      const docRef = doc(db, 'mixtapes', mixtapeId);
      await updateDoc(docRef, {
        voteCount: (mixtape.voteCount || 0) + 1,
        votedBy: [...(mixtape.votedBy || []), { userId: user.uid, date: new Date() }]
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#78bf45', '#96ed58', '#4f9120'],
      });

      setMixtapes(prevMixtapes => prevMixtapes.map(m => 
        m.id === mixtapeId ? { ...m, voteCount: (m.voteCount || 0) + 1, votedBy: [...(m.votedBy || []), { userId: user.uid, date: new Date() }] } : m
      ));

      setVoted((prevVoted) => ({
        ...prevVoted,
        [mixtapeId]: true,
      }));
    } catch (error) {
      console.error('Error updating vote count: ', error);
    }
  };

  const fetchMixtapes = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const mixtapesCollection = collection(db, 'mixtapes');
      let sortField;
      switch (activeTab) {
        case 'Latest':
          sortField = 'createdAt';
          break;
        case 'Most Upvotes':
          sortField = 'voteCount';
          break;
        case 'Most Comments':
          sortField = 'commentCount';
          break;
        default:
          sortField = 'createdAt';
      }

      let mixtapesQuery = query(
        mixtapesCollection,
        orderBy(sortField, 'desc'),
        limit(BATCH_SIZE)
      );

      if (lastDoc) {
        mixtapesQuery = query(
          mixtapesCollection,
          orderBy(sortField, 'desc'),
          startAfter(lastDoc),
          limit(BATCH_SIZE)
        );
      }

      const querySnapshot = await getDocs(mixtapesQuery);
      const newMixtapes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMixtapes(prev => [...prev, ...newMixtapes]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === BATCH_SIZE);
    } catch (error) {
      console.error('Error fetching mixtapes:', error);
    } finally {
      setLoading(false);
    }
  }, [lastDoc, loading, hasMore, activeTab]);

  const fetchMixtapesBySearch = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setIsSearching(true);
    try {
      const mixtapesCollection = collection(db, 'mixtapes');
      const mixtapesQuery = query(
        mixtapesCollection,
        where('name', '>=', searchQuery.toLowerCase()),
        where('name', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(20)
      );

      const querySnapshot = await getDocs(mixtapesQuery);
      const newMixtapes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSearchResults(newMixtapes);
    } catch (error) {
      console.error('Error fetching mixtapes by search:', error);
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

  return (
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
                  src={mixtape.imageUrl}
                  width={300}
                  height={300}
                  quality={75}
                />
                <h2 className="text-base text-center font-medium mt-1">{toSentenceCase(mixtape.name)}</h2>
                <div className="flex gap-1 mb-2 text-slate-600 hover:text-primary items-center cursor-pointer">
                  <FaRegComment className="text-base leading-none" />
                  <div className="text-xs leading-none">
                    {mixtape.commentCount || 0} Comments
                  </div>
                </div>

                <div
                  className={`flex flex-col absolute top-0 right-0 justify-center items-center border pb-1 rounded-sm px-2 cursor-pointer hover:border-[#78bf45] shadow-md hover:shadow-[#78bf45] ${voted[mixtape.id] ? 'border-[#78bf45] text-[#78bf45]' : 'border-gray-300 text-slate-600'}`}
                  onClick={() => handleUpvote(mixtape.id)} 
                >
                  <IoCaretUpSharp className={`text-base leading-none ${voted[mixtape.id] ? 'text-[#78bf45]' : 'text-slate-600'}`} />
                  <div className="text-[0.6rem] -mt-[1px] leading-none">{mixtape.voteCount || 0}</div>
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
  );
}