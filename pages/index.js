import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaSpotify } from 'react-icons/fa';
import ImageGallery from '@/components/Gallery';

function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 my-12">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">MINYFY your MIXTAPE</h1>
        </div>
        <div className="flex justify-center mt-4">
          <Link href="" passHref>
            <button className="bg-[#d92323] flex hover:opacity-80 text-white font-semibold py-2 px-6 rounded-full mr-4" disabled>
              <FaSpotify className="mr-2 text-2xl" /> Coming Soon...
            </button>
          </Link>
          <Link href="/lastfm" passHref>
            <div className="bg-[#d92323] hover:opacity-80 text-white font-semibold py-2 px-6 rounded-full">
              Connect to Last.fm
            </div>
          </Link>
        </div>
        <div className="mt-8">
          <ImageGallery/>
        </div>
      </div>
    </>
  );
}

export default Home;
