import React from 'react';

const images = [
  '/gallery/track_data (27).jpg',
  '/gallery/track_data (28).jpg',
  '/gallery/track_data (29).jpg',
  '/gallery/track_data (30).jpg',
  '/gallery/track_data (31).jpg',
  '/gallery/track_data (32).jpg'
];

const ImageGallery = () => {
  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {images.map((imageUrl, index) => (
        <div key={index} className="cursor-pointer" onClick={() => openImageInNewTab(imageUrl)}>
          <img src={imageUrl} alt={`Image ${index + 1}`} className="w-full h-auto rounded-lg shadow-md" />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
