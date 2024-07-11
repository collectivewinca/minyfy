import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaSpotify } from 'react-icons/fa';
import ImageGallery from '@/components/Gallery';

function Home() {
  return (
    <>
      <Header />
      <div className="flex md:justify-end justify-center md:mt-5 mt-24 mx-3">
          <Link href="/makeaminy" >
            <button className="bg-[#f28532] shadow-custom flex hover:opacity-80 text-white font-semibold py-2 px-6 rounded-full mr-2" >
               Customize Miny
            </button>
          </Link>
          <Link href="/lastfm" >
            <div className="bg-[#f28532] shadow-custom hover:opacity-80 text-white font-semibold py-2 px-6 rounded-full">
              Connect to Last.fm
            </div>
          </Link>
        </div>
      <div className="container mx-auto px-4 my-12">
        {/* <div className="text-center">
          <h1 className="text-4xl font-semibold">MINYFY your MIXTAPE</h1>
        </div> */}
        
        <div className="mt-8 md:mx-24">
          <ImageGallery/>
        </div>
      </div>
    </>
  );
}

export default Home;
