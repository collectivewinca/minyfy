import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { db, auth } from '@/firebase/config';
import { collection, query, getDoc,where, getDocs, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Confetti from 'react-confetti';

function Crates() {
  const [user, setUser] = useState(null);
  const [crates, setCrates] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const { crateId, status } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log("Fetching crates for user:", user.email);
        await fetchCrates(user.email);
      } else {
        setUser(null);
        console.log("Fetching public crates");
        await fetchPublicCrates();
      }

      if (crateId && status === 'success') {
        console.log("Updating crate status for ID:", crateId);
        setShowCongrats(true);
        await updateCrateStatus(crateId);
        setIsProcessing(false);
        
        if (user) {
          await fetchCrates(user.email);
        } else {
          await fetchPublicCrates();
        }
      }

    });

    return () => unsubscribe();
  }, [crateId, status]);

  const fetchCrates = async (email) => {
    try {
      const q = query(collection(db, "crates"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const cratesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      cratesData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
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
      cratesData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
      console.log("Fetched public crates:", cratesData);
      setCrates(cratesData);
    } catch (error) {
      console.error("Error fetching public crates:", error);
    }
  };

  const updateCrateStatus = async (id) => {
      try {
        // Fetch the crate document to get email and other details
        const crateRef = doc(db, "crates", id);
        const crateDoc = await getDoc(crateRef);
    
        if (!crateDoc.exists()) {
          console.error("Crate not found:", id);
          return;
        }
    
        const crateData = crateDoc.data();
    
        // Update the payment status
        await updateDoc(crateRef, { paymentStatus: "success" });
        console.log("Crate status updated for ID:", id);
    
        // Prepare data for the email API
        const emailData = {
          name: crateData.userName,
          title: crateData.name,
          shortenedLink: crateData.shortenedLink || '',
          email: crateData.email
        };
    
        console.log(`Sending email to: ${emailData.email}`);
    
        // Send email using your Next.js API
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
    
        if (!response.ok) {
          throw new Error('Failed to send email');
        }
    
        const result = await response.json();
        console.log('Email sent successfully:', result.message);
      } catch (error) {
        console.error("Error updating crate status and sending email:", error);
      }
  };

  console.log("crates:", crates);

  

  if (!user) {
    return (
      <>
        <Header />
        <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
          <h1 className='text-4xl text-center font-bold font-jakarta'>Crates</h1>
          <p className="mt-6 text-2xl font-bold text-center">User not signed in. Please sign in to view your crates.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className='flex mt-6 flex-col min-h-screen px-4 mb-10'>
        <h1 className='text-4xl text-center font-bold font-jakarta'>Crates</h1>
          {showCongrats && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <Confetti width={window.innerWidth} height={window.innerHeight} />
            </div>
            <div className="fixed font-jakarta inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg text-center max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">Congratulations on your MINY purchase!</h2>
                <img src="./delivery.gif" alt="Celebrate" className="w-1/2 mx-auto" />
                <p className="mb-4">You will receive a confirmation email soon.</p>
                <button 
                  onClick={() => setShowCongrats(false)}
                  className="bg-black shadow-custom text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  {isProcessing ? 'Finalizing...' : 'View Crates'}
                </button>
              </div>
            </div>
          </>
        )}
        {crates.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 mx-6 font-jakarta md:grid-cols-2 gap-4">
            {crates.map((crate) => (
              <div key={crate.id} className="bg-white shadow border rounded-lg overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-1/3">
                  <img 
                    src={crate.backgroundImage || crate.imageUrl} 
                    alt={`${crate.name}'s artwork`} 
                    className="w-full h-48 sm:h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                  />
                </div>
                <div className="sm:w-2/3 p-4">
                  <h2 className="text-xl font-semibold mb-2">{`${crate.name}'s Mixtape`}</h2>
                  <p className="text-sm text-gray-600 mb-1">Email: {crate.email}</p>
                  <p className="text-sm text-gray-600 mb-1">Payment Status: {crate.paymentStatus}</p>
                  <p className="text-sm text-gray-600 mb-1">Date: {new Date(crate.dateTime).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mb-1">Order ID: {crate.id}</p>
                  {crate.shortenedLink && (
                    <a href={crate.shortenedLink} target="_blank" rel="noopener noreferrer" className="text-lime-600 font-medium underline text-sm">
                      {crate.shortenedLink.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 font-extrabold text-3xl text-center">No crates found.</p>
        )}
      </div>
    </>
  );
}

export default Crates;