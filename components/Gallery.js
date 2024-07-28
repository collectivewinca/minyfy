import React from 'react';
import Image from 'next/image';

const images = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721204117583.jpg?alt=media&token=8f27dc59-7778-4330-b560-d2b518110cc6',
    link: '/play/JLoRn9KQkc73B7ELFZCB'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721203632235.jpg?alt=media&token=d0674793-0f62-4d13-9f21-411d824030a0',
    link: '/play/6iUnjN7Q4Y4WPOIz0ZvT'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721154880789.jpg?alt=media&token=44046b6d-08b3-478c-8a25-a02cbe13dfae',
    link: '/play/xIZr3VYNvKJ0A6x9s8l9'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721204273551.jpg?alt=media&token=b2ee7a26-16ca-4516-bcc6-8cce25fb0776',
    link: '/play/8Xcu8h60b8OFCSACtbIU'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721204350031.jpg?alt=media&token=54179edc-4a7b-424f-a01c-f3a7126a12e2',
    link: '/play/Bjw2LfBjhcH0yGx3X0ib'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/images%2Fminy-1721204414553.jpg?alt=media&token=d69e2797-73bd-4c7e-a7ef-9c51a4bebac9',
    link: '/play/O6by6qcLUGVHgrWgUn44'
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
          <Image 
            width={100}
            height={100}
            src={image.imageUrl} 
            unoptimized={true}
            loading={index === 0 ? "eager" : "lazy"}
            alt={`Image ${index + 1}`} 
            className="w-full h-auto rounded-lg shadow-md transition-all duration-500 ease-in-out hover:rounded-full hover:rotate-360"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
