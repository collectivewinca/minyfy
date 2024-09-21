import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/Header';
import { IoCaretUpSharp } from 'react-icons/io5';
import Image from 'next/image';
import { FaRegComment } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

const BATCH_SIZE = 24;

export default function Catalog() {
  const [mixtapes, setMixtapes] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState({});
  const [votes, setVotes] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
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
    const fetchVotes = async () => {
      const newVotes = {};
      const votePromises = mixtapes.map(async (mixtape) => {
        const docRef = doc(db, "votes", mixtape.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          newVotes[mixtape.id] = docSnap.data().voteCount || 0;
        } else {
          newVotes[mixtape.id] = 0;
        }
      });
      await Promise.all(votePromises);
      setVotes(newVotes);
    };

    fetchVotes();
  }, [mixtapes]);

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
  
    try {
      const docRef = doc(db, 'votes', mixtapeId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const hasVotedToday = data.votedBy?.some(vote =>
          vote.userId === user.uid &&
          vote.date.toDate().toDateString() === new Date().toDateString()
        );
  
        if (hasVotedToday) {
          alert("You've already voted today!");
          return;
        }
  
        await updateDoc(docRef, {
          voteCount: increment(1),
          votedBy: [...(data.votedBy || []), { userId: user.uid, date: new Date() }]
        });
  
      } else {
        await setDoc(docRef, {
          mixtapeId,
          voteCount: 1,
          votedBy: [{ userId: user.uid, date: new Date() }]
        });
      }
  
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#78bf45', '#96ed58', '#4f9120'],
      });
  
      setVotes((prevVotes) => ({
        ...prevVotes,
        [mixtapeId]: (prevVotes[mixtapeId] || 0) + 1,
      }));
  
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
      let mixtapesQuery = query(
        mixtapesCollection,
        orderBy('createdAt', 'desc'),
        limit(BATCH_SIZE)
      );

      if (lastDoc) {
        mixtapesQuery = query(
          mixtapesCollection,
          orderBy('createdAt', 'desc'),
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
  }, [lastDoc, loading, hasMore]);

  useEffect(() => {
    fetchMixtapes();
  }, []); // Only run once on component mount
  
  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100 &&
      !loading &&
      hasMore
    ) {
      fetchMixtapes();
    }
  }, [fetchMixtapes, loading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container font-jakarta mx-auto py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-3 gap-5">
          {mixtapes.map((mixtape, index) => (
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
                  {mixtape.comments && mixtape.comments.length > 0 ? mixtape.comments.length : 0} Comments
                </div>
              </div>

              <div
                className={`flex flex-col absolute top-0 right-0 justify-center items-center border pb-1 rounded-sm px-2 cursor-pointer hover:border-[#78bf45] shadow-md hover:shadow-[#78bf45] ${voted[mixtape.id] ? 'border-[#78bf45] text-[#78bf45]' : 'border-gray-300 text-slate-600'}`}
                onClick={() => handleUpvote(mixtape.id)} 
              >
                <IoCaretUpSharp className={`text-base leading-none ${voted[mixtape.id] ? 'text-[#78bf45]' : 'text-slate-600'}`} />
                <div className="text-[0.6rem] -mt-[1px] leading-none">{votes[mixtape.id] || 0}</div>
              </div>
            </div>
          ))}
        </div>
        {loading && <div className="animate-spin mx-auto my-4 ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-[#78bf45]"></div>}
        {!hasMore && <p className="text-center font-medium font-jakarta mt-4">END</p>}
      </div>
    </div>
  );
}