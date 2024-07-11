import React, { useState } from 'react';
import Header from '@/components/Header';
import TracksList from '@/components/TrackList'; // Import TracksList component
import ArtistSection from '@/components/ArtistSection';
import TagSection from '@/components/TagSection';
import MinySection from '@/components/MinySection';
import CustomTrack from '@/components/CustomTrack';



const Custom = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [inputValue, setInputValue] = useState('User');
  const [backgroundImage, setBackgroundImage] = useState('/gallery/img6.png'); // Default image
  const [tracks, setTracks] = useState([]);

  // Define your images array
  const images = [
    'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/assets%2Fimg1.png?alt=media&token=6d4f5c4a-7855-43ef-83c7-c542e54d368d',
    'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/assets%2Fimg2.png?alt=media&token=95eb58bb-b11b-4b0d-97f1-7143f8a03cee',
    'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/assets%2Fimg3.png?alt=media&token=b053aec5-aade-4a21-a870-58c1562b0e89',
    'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/assets%2Fimg4.png?alt=media&token=b5ad8ac4-8e5b-40e1-b1c1-5b3bf97ea24d',
    'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/assets%2Fimg5.png?alt=media&token=d9db2edb-216e-441b-b3b2-ce8c942378e7',
    'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/assets%2Fimg6.png?alt=media&token=f5d3b27a-2282-40d9-b22a-8796b89ffbb8'
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
      
      <div className="container md:mx-auto md:px-4 flex flex-col justify-center items-center px-2 my-2 md:my-6">
       <div className='md:w-[73%] flex justify-center items-center md:mx-auto '>
          {tracks.length > 0 ? (
              <MinySection 
              name={inputValue}
              backgroundImage={backgroundImage}
              tracks={tracks}
            />
          ) : (
            <div  className="relative cursor-pointer" >
                <div className="overlay1"></div>
                <img className="h-auto max-w-full rounded-2xl" src="/top1.jpg" alt="" />
                <div className="cardContent">
                    <p className="text-white font-extrabold md:text-4xl text-xl tracking-wide absolute bottom-0 left-0 px-4   py-2">Customize Miny</p>
                </div>
            </div>
            
          
          )}
          
        </div>
        <div className='flex flex-col justify-start w-full md:w-[70%] '>
          <div className='text-lg mb-1 mt-3 justify-start text-neutral-800 font-medium'>Select Category</div>
          <select
            className="mb-3 px-5 py-3 font-thin font-mono bg-neutral-200 text-lg text-neutral-500 rounded-xl"
            value={selectedOption}
            onChange={handleSelection}
          >
            <option value="">Select an option</option>
            <option value="tracks">Tracks</option>
            <option value="searchArtist">Artists</option>
            <option value="genre">Genres</option>
            <option value="customize">Customize Miny</option>
          </select>
        </div>
        
        {/* <div>
          <img className="h-[120vh] rounded-2xl" src={backgroundImage} alt="Selected Background" />
        </div> */}



        

        <div className='flex flex-col justify-start w-full md:w-[70%]'>
        <div className='text-lg mb-1 mt-3 justify-start text-neutral-800 font-medium'>Enter Brand Name </div>
          <input
            className="mb-3 px-5 py-3 font-thin font-mono bg-neutral-200 text-lg text-neutral-500  rounded-xl"
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Name here...'
          />
        </div>

        <div className='flex flex-col justify-start w-full md:w-[70%]'>
          <div className='text-lg mb-1 mt-3 justify-start text-neutral-800 font-medium'>Select Background Image</div>
          <div className="grid md:grid-cols-6 grid-cols-3  gap-4 ">
            {images.map((image, index) => (
              <img
                key={index}
                className={`cursor-pointer  w-full rounded-xl ${backgroundImage === image ? 'border-2 border-black p-1' : 'border-[2.8px] border-transparent'}`}
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
      
      
    </>
  );
};

export default Custom;
