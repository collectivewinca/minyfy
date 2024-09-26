import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { IoCaretUpSharp } from 'react-icons/io5';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {FaRegComment} from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TagsComponent() {
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState(null);
  const [voted, setVoted] = useState({});
  const router = useRouter();

  console.log('TagsComponent -> tags', tags);

  useEffect(() => {
    fetchTags();

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

  const fetchTags = async () => {
    const tagsQuery = query(collection(db, 'tags'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(tagsQuery);
    const fetchedTags = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTags(fetchedTags);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleUpvote = async (tagId) => {
    if (!user) {
      handleLogin();
      return;
    }

    const tag = tags.find(t => t.id === tagId);
    const hasVoted = tag.votedBy?.some(vote => vote.userId === user.uid);

    if (hasVoted) {
      alert("You've already voted for this tag!");
      return;
    }

    try {
      const docRef = doc(db, 'tags', tagId);
      await updateDoc(docRef, {
        voteCount: (tag.voteCount || 0) + 1,
        votedBy: [...(tag.votedBy || []), { userId: user.uid, date: new Date() }],
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#78bf45', '#96ed58', '#4f9120'],
      });

      setTags(prevTags =>
        prevTags.map(t =>
          t.id === tagId
            ? {
                ...t,
                voteCount: (t.voteCount || 0) + 1,
                votedBy: [...(t.votedBy || []), { userId: user.uid, date: new Date() }],
              }
            : t
        )
      );

      setVoted(prevVoted => ({
        ...prevVoted,
        [tagId]: true,
      }));
    } catch (error) {
      console.error('Error updating vote count: ', error);
    }
  };

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  return (
    <div className=" px-4 pb-8">
      <div className="flex flex-col font-jakarta  gap-6">
        {tags.map(tag => (
          <div key={tag.id} className=" relative">
            {/* Tag Name */}
            <h2 className="md:text-3xl text-xl font-semibold mb-4">{tag.tagName}</h2>

            {/* Mixtapes under the tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-3 gap-5">
              {tag.selectedMixtapes.map((mixtape, index) => (
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
               {/* <div className="flex gap-1 mb-2 text-slate-600 hover:text-primary items-center cursor-pointer">
                 <FaRegComment className="text-base leading-none" />
                 <div className="text-xs leading-none">
                   {mixtape.comments && mixtape.comments.length > 0 ? mixtape.comments.length : 0} Comments
                 </div>
               </div> */}

               {/* <div
                 className={`flex flex-col absolute top-0 right-0 justify-center items-center border pb-1 rounded-sm px-2 cursor-pointer hover:border-[#78bf45] shadow-md hover:shadow-[#78bf45] ${voted[mixtape.id] ? 'border-[#78bf45] text-[#78bf45]' : 'border-gray-300 text-slate-600'}`}
                 onClick={() => handleUpvote(mixtape.id)} 
               >
                 <IoCaretUpSharp className={`text-base leading-none ${voted[mixtape.id] ? 'text-[#78bf45]' : 'text-slate-600'}`} />
                 <div className="text-[0.6rem] -mt-[1px] leading-none">{mixtape.voteCount || 0}</div>
               </div> */}
             </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
