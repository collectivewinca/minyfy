import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';
import { FaDownload } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const MinySection = ({ name, backgroundImage, tracks }) => {
  const [isFavorite, setIsFavorite] = useState(true); 
  const trackDataContainerRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!trackDataContainerRef.current) {
      console.error('Error: trackDataContainerRef is not defined.');
      return;
    }

    try {
      const blob = await toBlob(trackDataContainerRef.current);
      if (blob) {
        const random = Math.floor(Math.random() * 1000);
        download(blob, `miny${random}.jpg`);
      } else {
        console.error('Error: Blob is null.');
      }
    } catch (error) {
      console.error('Error converting to image:', error);
    }
  };

  // Get today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className='py-7'>
      <div ref={trackDataContainerRef} className='overflow-y-auto '>
        <div className="relative  cursor-pointer ">
          <div className="overlay"></div>
          <img className="h-full w-full " src={backgroundImage} alt="Background" />
          <div className="flex flex-col justify-between items-end md:pr-5 pr-2 absolute right-0 top-0 h-full pb-4">
            <p className="text-white font-medium text-lg tracking-wide ">
              <img src="/stamp.png" alt="Minyfy Logo" className="md:h-[11vh] h-[4vh] md:px-2 px-2   mt-4" />
            </p>
            <div className=" flex flex-col md:gap-4 gap-1 items-end md:text-xl text-[0.6rem] font-wittgenstein font-base md:px-4 px-2 right-0 text-neutral-300  tracking-wider">
              {tracks.map((track, index) => (
               <div key={index}>
                  {track.length > 39 ? `${track.slice(0, 39)}..` : track}
                </div>
             
              ))}
            </div>
            <div className=" flex flex-col md:gap-4 gap-1 items-end md:text-xl text-[0.6rem] font-wittgenstein font-base md:px-4 px-2  right-0 text-neutral-300 tracking-wider">
              <p>MINY Order for <strong className='text-[#f48531]'>{name}</strong></p>
              <p>{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex md:flex-row gap-3 flex-col justify-between items-center mt-4">
        <button
          onClick={() => {setIsFavorite(!isFavorite)}}
          className="bg-[#f48531] hover:opacity-80 shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-6 rounded-full"
        >
         {isFavorite ? (<FaRegHeart className='text-xl'/>) : (<FaHeart className='text-xl'/>)}  Add to Favorites
        </button>
        <button
          onClick={handleDownloadImage}
          className="bg-[#f48531] hover:opacity-80 shadow-custom flex items-center gap-2 text-black font-semibold py-3 px-6 rounded-full"
        >
          <FaDownload /> Download & share
        </button>
      </div>
    </div>
  );
};

export default MinySection;
