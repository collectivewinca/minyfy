import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { db, auth } from '@/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

function Crates() {
  const [user, setUser] = useState(null);
  const [crates, setCrates] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { crateId, status } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        console.log("Fetching crates for user:", user.email);
        await fetchCrates(user.email);
      } else {
        setUser(null);
        console.log("Fetching public crates");
        await fetchPublicCrates();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateStatusAndFetch = async () => {
      if (crateId && status === 'success') {
        console.log("Updating crate status for ID:", crateId);
        await updateCrateStatus(crateId);
        // Fetch crates again after updating status
        if (user) {
          await fetchCrates(user.email);
        } else {
          await fetchPublicCrates();
        }
      }
    };

    updateStatusAndFetch();
  }, [crateId, status]);

  const fetchCrates = async (email) => {
    try {
      const q = query(collection(db, "crates"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const cratesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      cratesData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Sort by dateTime descending
      console.log("Fetched crates:", cratesData);
      setCrates(cratesData);
    } catch (error) {
      console.error("Error fetching crates:", error);
    }
  };

  const fetchPublicCrates = async () => {
    try {
      const q = query(collection(db, "crates"), where("public", "==", true));
      const querySnapshot = await getDocs(q);
      const cratesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      cratesData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Sort by dateTime descending
      console.log("Fetched public crates:", cratesData);
      setCrates(cratesData);
    } catch (error) {
      console.error("Error fetching public crates:", error);
    }
  };

  const updateCrateStatus = async (id) => {
    try {
      const crateRef = doc(db, "crates", id);
      await updateDoc(crateRef, { paymentStatus: "success" });
      console.log("Crate status updated for ID:", id);
    } catch (error) {
      console.error("Error updating crate status:", error);
    }
  };

  console.log("crates:", crates);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
          <h1 className='text-4xl text-center font-bold font-jakarta'>Crates</h1>
          <p className="mt-6 text-center">User not signed in. Please sign in to view your crates.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
        <h1 className='text-4xl text-center font-bold font-jakarta'>Crates</h1>
        {crates.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {crates.map((crate) => (
              <li key={crate.id} className="bg-white shadow flex rounded-lg p-4 relative">
                <img 
                  src={crate.backgroundImage} 
                  alt={`${crate.name}'s artwork`} 
                  className="w-full h-48 object-cover rounded-lg "
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{crate.name}'s Mixtape</h2>
                  <p>Email: {crate.email}</p>
                  <p>Payment Status: {crate.paymentStatus}</p>
                  <p>Date: {new Date(crate.dateTime).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 font-extrabold text-3xl text-center">No crates found.</p>
        )}
      </div>
    </>
  );
}

export default Crates;
