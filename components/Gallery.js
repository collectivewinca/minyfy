import React from 'react';

const images = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721154628219.jpg?alt=media&token=9764619f-a36a-4792-806a-54db12ad5645',
    link: '/play/Rn85U2A7hbQ97MxV44iJ'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721154359396.jpg?alt=media&token=6d183bd6-5b83-4322-b346-73de726e9438',
    link: '/play/gxDQ9DEZZYNU6cgObNw5'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721154880789.jpg?alt=media&token=44046b6d-08b3-478c-8a25-a02cbe13dfae',
    link: '/play/xIZr3VYNvKJ0A6x9s8l9'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721154097960.jpg?alt=media&token=55f1f2b4-0094-486b-ae0f-9c20131009d6',
    link: '/play/pYK9dWqKFDe0CWQ2T2fP'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1720982424999.jpg?alt=media&token=7ec5d8cd-53ae-4e55-afda-81d5c5668e5c',
    link: '/play/0tRf3DqkCHQNZHxkwqxY'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721154228121.jpg?alt=media&token=bdb1acd8-b6d7-4291-b643-16184da968cc',
    link: '/play/nMY0UtYbbp5qH0QhbqIP'
  }
];

const ImageGallery = () => {
  const openImageInNewTab = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="cursor-pointer  " onClick={() => openImageInNewTab(image.link)}>
          <img 
            src={image.imageUrl} 
            alt={`Image ${index + 1}`} 
            className="w-full h-auto rounded-lg shadow-md transition-all duration-500 ease-in-out hover:rounded-full hover:rotate-360"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
