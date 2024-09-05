import React from 'react';
import Image from 'next/image';

const images = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-0a2b761b-2a29-40fc-a44b-7ae3dee54b03.png?alt=media&token=b017d05f-c168-4998-bc34-a7f54fb498a9',
    link: 'https://minyfy.subwaymusician.xyz/play/Qe6nRzVhSPWd0IhSsP4g'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-686cc899-48b6-42bb-b474-77f05f668731.png?alt=media&token=b94c09b2-0894-430b-b622-a20bf912e5ca',
    link: 'https://minyfy.subwaymusician.xyz/play/hR4s0Xgbt4JhbZIOI01X'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-866326cc-5c79-42ab-9411-a500a2c4ff66.png?alt=media&token=ba1ca12e-5512-466f-9880-3426dd92be5f',
    link: 'https://minyfy.subwaymusician.xyz/play/2RTSHUOUitZKHPe5tHz3'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-5e21563c-987d-469b-a958-f5b38b876f72.png?alt=media&token=c03a4464-44a2-4d86-9854-a4d8397f4815',
    link: 'https://minyfy.subwaymusician.xyz/play/n7ff7fFKLVIRl7ITw8n2'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-edca1ab3-74b6-473b-a6f2-d2b9acc8606a.png?alt=media&token=d07e0600-0d7f-4f48-ba8b-c4259150b3cc',
    link: 'https://minyfy.subwaymusician.xyz/play/k0KjOatJ2lZG7oxQ83W6'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6051bfd9-30c4-4ce4-8c01-ae2f27b211c2.png?alt=media&token=638bf1a0-1274-459c-92e6-e64640856020',
    link: 'https://minyfy.subwaymusician.xyz/play/Y8gzr3Mid7DI0OqaRV73'
  }
];

const ImageGallery = () => {
  const openImageInNewTab = (link) => {
    window.open(link, '_blank');
  };

  const renderImageSection = (title, subtitle, startIndex, endIndex) => (
    <div className="mb-8 font-jakarta">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-600 mb-4">{subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.slice(startIndex, endIndex).map((image, index) => (
          <div key={index} className="cursor-pointer" onClick={() => openImageInNewTab(image.link)}>
            <Image 
              width={100}
              height={100}
              src={image.imageUrl} 
              unoptimized={true}
              loading={index === 0 ? "eager" : "lazy"}
              alt={`Image ${startIndex + index + 1}`} 
              className="w-full h-auto rounded-lg shadow-md transition-all duration-500 ease-in-out hover:rounded-full hover:rotate-360"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      {renderImageSection("Top This Week", "Most popular mixtapes of the week", 0, 3)}
      {renderImageSection("Featured Artists", "Discover mixtapes from featured artists", 3, 6)}
    </div>
  );
};

export default ImageGallery;
