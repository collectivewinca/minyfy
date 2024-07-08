import React from 'react';

const images = [
  '/gallery/miny (1).jpg',
  '/gallery/miny (2).jpg',
  '/gallery/miny (3).jpg',
  '/gallery/miny (4).jpg',
  '/gallery/miny (5).jpg',
  '/gallery/miny (6).jpg'
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
