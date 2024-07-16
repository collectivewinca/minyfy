import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaSpotify } from 'react-icons/fa';
import ImageGallery from '@/components/Gallery';
import { IoRocketSharp } from "react-icons/io5";
import { useRouter } from 'next/router';

function Home() {
  const router = useRouter();
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 my-6">
        <div className="w-full flex justify-center">
          <div>
              <button class="btn" onClick={() => {router.push("/makeaminy")}}><i class="animation"></i>
             <IoRocketSharp className="text-xl" />
             Create A Miny<i class="animation"></i>
              </button>
          </div>
        </div>
        
        <div className="mt-8">
          <ImageGallery/>
        </div>
      </div>
    </>
  );
}

export default Home;
