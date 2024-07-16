import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

function Collections() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserCollections(user.email);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserCollections = async (userEmail) => {
    try {
      const q = query(collection(db, "mixtapes"), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);

      const imageUrls = querySnapshot.docs
        .filter(doc => doc.data().imageUrl) // Filter out documents without imageUrl field
        .map(doc => ({
          id: doc.id,
          url: doc.data().imageUrl
        }));

      setImages(imageUrls);
    } catch (error) {
      console.error("Error fetching user collections: ", error);
    }
  };

  const openImageInNewTab = (docId) => {
    router.push(`/play/${docId}`);
  };

  return (
    <>
      <Header />
      <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
        <h1 className='text-4xl text-center font-bold font-jakarta'>Collections</h1>
        {!user ? (
          <p className='mt-4 text-center text-3xl font-bold font-jakarta text-neutral-600'>User not Logged In!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="cursor-pointer transform transition-transform duration-300 hover:scale-105" onClick={() => openImageInNewTab(image.id)}>
                <img src={image.url} alt={`Image ${index + 1}`} className="w-full h-auto rounded-lg shadow-md" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Collections;
