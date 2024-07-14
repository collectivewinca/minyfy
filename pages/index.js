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
