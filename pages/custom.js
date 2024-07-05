import React, { useState } from 'react';
import Header from '@/components/Header';
import TracksList from '@/components/TrackList'; // Import TracksList component
import ArtistSection from '@/components/ArtistSection';
import TagSection from '@/components/TagSection';
import MinySection from '@/components/MinySection';
import CustomTrack from '@/components/CustomTrack';

const Custom = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [inputValue, setInputValue] = useState('user');
  const [backgroundImage, setBackgroundImage] = useState('/gallery/img6.png'); // Default image
  const [tracks, setTracks] = useState([]);

  // Define your images array
  const images = [
    '/gallery/img1.png',
    '/gallery/img2.png',
    '/gallery/img3.png',
    '/gallery/img4.png',
    '/gallery/img5.png',
    '/gallery/img6.png'
  ];

  const handleSelection = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleImageSelection = (imagePath) => {
    setBackgroundImage(imagePath);
  };

  const handleTracksChange = (newTracks) => {
    setTracks(newTracks);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 my-12 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold underline mb-4 text-center text-black">Customize Your Miny</h1>
        <div className='flex flex-col justify-start w-full md:w-[70%]'>
          <div className='text-lg mb-1 mt-3 justify-start text-neutral-800 font-medium'>Select Category</div>
          <select
            className="mb-3 p-1 font-base font-mono bg-transparent text-lg border-neutral-800 border-[2.5px] text-neutral-500 rounded-xl"
            value={selectedOption}
            onChange={handleSelection}
          >
            <option value="">Select an option</option>
            <option value="tracks">Top Tracks</option>
            <option value="searchArtist">Search Artist</option>
            <option value="genre">Top Genre</option>
            <option value="customize">Customize Miny</option>
          </select>
        </div>
        
        {/* <div>
          <img className="h-[120vh] rounded-2xl" src={backgroundImage} alt="Selected Background" />
        </div> */}

        

        <div className='flex flex-col justify-start w-full md:w-[70%]'>
        <div className='text-lg mb-1 mt-3 justify-start text-neutral-800 font-medium'>Enter Your Name</div>
          <input
            className="mb-3 px-2 p-1 font-base font-mono bg-transparent text-lg text-neutral-500 border-neutral-800 border-[2.5px] rounded-xl"
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Enter your name here...'
          />
        </div>

        <div className='flex flex-col justify-start w-full md:w-[70%]'>
          <div className='text-lg mb-1 mt-3 justify-start text-neutral-800 font-medium'>Select Background Image</div>
          <div className="grid grid-cols-3 gap-4 ">
            {images.map((image, index) => (
              <img
                key={index}
                className={`cursor-pointer  w-full rounded-xl ${backgroundImage === image ? 'border-2 border-black p-1' : 'border-2 border-transparent'}`}
                src={image}
                alt={`Background ${index + 1}`}
                onClick={() => handleImageSelection(image)}
              />
            ))}
          </div>
        </div>

        {selectedOption === 'tracks' && (
          <TracksList onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'searchArtist' && (
          <ArtistSection onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'genre' && (
          <TagSection onTracksChange={handleTracksChange} />
        )}

        {selectedOption === 'customize' && (
          <CustomTrack onTracksChange={handleTracksChange} />
        )}
      </div>
      <div className='md:w-[73%] flex justify-center items-center md:mx-auto mx-4 '>
          {tracks.length > 0 ? (
              <MinySection 
              name={inputValue}
              backgroundImage={backgroundImage}
              tracks={tracks}
            />
          ) : (
            <img className=" rounded-2xl" src={backgroundImage} alt="Selected Background" />
          
          )}
          
        </div>
      
    </>
  );
};

export default Custom;
