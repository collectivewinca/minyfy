import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { db, auth } from '@/firebase/config';
import { collection, query, getDoc,where, getDocs, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Confetti from 'react-confetti';
import Head from 'next/head';
import { NextSeo } from 'next-seo';

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
        console.log("Fetching crates for user:", user.email);
        await fetchCrates(user.email);
      } else {
        console.log("Fetching public crates");
        await fetchPublicCrates();
      }

      if (crateId && status === 'success') {
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
      // Fetch the crate data
      const { data: crateData, error: fetchError } = await supabase
        .from('crates')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!crateData) {
        console.error("Crate not found:", id);
        return;
      }

      // Update the payment status
      const { error: updateError } = await supabase
        .from('crates')
        .update({ paymentStatus: "success" })
        .eq('id', id);

      if (updateError) throw updateError;
      console.log("Crate status updated for ID:", id);

      // Prepare data for the email API
      const emailData = {
        name: crateData.userName,
        title: crateData.name,
        shortened_link: crateData.shortened_link || '',
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


  

  if (!user) {
    return (
      <>  
        <NextSeo
          title="My Crates - View Your Miny Vinyl Purchase History | Miny Vinyl"
          description="Keep track of your musical treasures! Your Miny Vinyl 'Crates' section lets you view your purchased MINY history, easily access your downloads, and rediscover your favorite sonic gems."
          canonical="https://minyfy.minyvinyl.com/crates" 
          openGraph={{
            url: 'https://minyfy.minyvinyl.com/crates', 
            title: 'My Miny Crates: Your Music Collection Awaits | Miny Vinyl', 
            description: "Never lose track of a beat! Your Miny Vinyl 'Crates' provide easy access to your purchased mixtapes. Rediscover, download, and enjoy your music anytime.",
            images: [
              {
                url: 'https://minyfy.minyvinyl.com/vinyl.png', 
                width: 1200,
                height: 630,
                alt: 'Miny Vinyl - Your Music Purchase History and Downloads',
              },
            ],
            site_name: 'Miny Vinyl',
          }}
          twitter={{
            handle: '@minyvinyl',
            site: '@minyvinyl',
            cardType: 'summary_large_image',
            title: "Keep Your Mixtapes Safe: Check Out Your Miny Vinyl Crates! 🎧", 
            description: "View your purchased Miny Vinyl mixtapes anytime, anywhere. Access your downloads, organize your collection, and keep the music flowing!",
          }}
          additionalJsonLd={[
            {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'My Crates - View Your Miny Vinyl Purchase History',
              description: "Keep track of your musical treasures! Your Miny Vinyl 'Crates' section lets you view your purchased MINY history, easily access your downloads, and rediscover your favorite sonic gems.",
              url: 'https://minyfy.minyvinyl.com/crates', 
            },
          ]}
        />
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
      <Head>
        <title>My Crates - View Your Miny Vinyl Purchase History | Miny Vinyl</title>
        <meta
          name="description"
          content="Keep track of your musical treasures! Your Miny Vinyl 'Crates' section lets you view your purchased MINY history, easily access your downloads, and rediscover your favorite sonic gems."
        />
        <meta
          name="keywords"
          content="Miny Vinyl,MINY purchase history, music downloads, mixtape collection, my crates, music library, digital music, music MINY purchases"
        />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />

        {/* Open Graph tags for social sharing */}
        <meta property="og:site_name" content="Miny Vinyl" />
        <meta property="og:locale" content="en_US" />
        <meta 
          property="og:title" 
          content="My Miny Crates: Your Music Collection Awaits | Miny Vinyl" 
        />
        <meta
          property="og:description"
          content="Never lose track of a beat! Your Miny Vinyl 'Crates' provide easy access to your purchased mixtapes. Rediscover, download, and enjoy your music anytime."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minyfy.minyvinyl.com/crates" /> 
        <meta
          property="og:image"
          content="https://minyfy.minyvinyl.com/vinyl.png" 
        />
        <meta property="og:image:alt" content="Miny Vinyl - Your Music Purchase History and Downloads" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@minyvinyl" />
        <meta name="twitter:creator" content="@minyvinyl" />
        <meta
          name="twitter:title"
          content="Keep Your Mixtapes Safe: Check Out Your Miny Vinyl Crates! 🎧"
        />
        <meta
          name="twitter:description"
          content="View your purchased Miny Vinyl mixtapes anytime, anywhere. Access your downloads, organize your collection, and keep the music flowing!"
        />
        <meta
          name="twitter:image"
          content="https://minyfy.minyvinyl.com/vinyl.png" 
        />
      </Head>
      <NextSeo
        title="My Crates - View Your Miny Vinyl Purchase History | Miny Vinyl"
        description="Keep track of your musical treasures! Your Miny Vinyl 'Crates' section lets you view your purchased MINY history, easily access your downloads, and rediscover your favorite sonic gems."
        canonical="https://minyfy.minyvinyl.com/crates" 
        openGraph={{
          url: 'https://minyfy.minyvinyl.com/crates', 
          title: 'My Miny Crates: Your Music Collection Awaits | Miny Vinyl', 
          description: "Never lose track of a beat! Your Miny Vinyl 'Crates' provide easy access to your purchased mixtapes. Rediscover, download, and enjoy your music anytime.",
          images: [
            {
              url: 'https://minyfy.minyvinyl.com/vinyl.png', 
              width: 1200,
              height: 630,
              alt: 'Miny Vinyl - Your Music Purchase History and Downloads',
            },
          ],
          site_name: 'Miny Vinyl',
        }}
        twitter={{
          handle: '@minyvinyl',
          site: '@minyvinyl',
          cardType: 'summary_large_image',
          title: "Keep Your Mixtapes Safe: Check Out Your Miny Vinyl Crates! 🎧", 
          description: "View your purchased Miny Vinyl mixtapes anytime, anywhere. Access your downloads, organize your collection, and keep the music flowing!",
        }}
        additionalJsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'My Crates - View Your Miny Vinyl Purchase History',
            description: "Keep track of your musical treasures! Your Miny Vinyl 'Crates' section lets you view your purchased MINY history, easily access your downloads, and rediscover your favorite sonic gems.",
            url: 'https://minyfy.minyvinyl.com/crates', 
          },
        ]}
      />
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
                  disabled={isProcessing}
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
                  <p 
                    className={`text-sm mb-1 ${
                      crate.paymentStatus === "success" ? "text-lime-600" : "text-gray-600"
                    }`}
                  >
                    Payment Status: {crate.paymentStatus}
                  </p>
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