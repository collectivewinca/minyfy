import React from 'react';
import Image from 'next/image';

const images = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-0a2b761b-2a29-40fc-a44b-7ae3dee54b03.png?alt=media&token=b017d05f-c168-4998-bc34-a7f54fb498a9',
    link: 'https://go.minyvinyl.com/aclfestanthem',
    label: 'Top Mixtape 1'

  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-ffdfa175-dd5f-4fd9-8e63-8d658add631b.png?alt=media&token=70216cab-3124-4430-b03a-88e56f255b0c',
    link: 'https://go.minyvinyl.com/offplaylist1',
    label: 'Top Mixtape 2'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6dbf84fd-a28e-4576-a408-f0711ebdf605.png?alt=media&token=957a684f-a1d0-4690-9e68-b5a1c3ed300e',
    link: 'https://go.minyvinyl.com/thebubberfiles',
    label: 'Top Mixtape 3'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-5e21563c-987d-469b-a958-f5b38b876f72.png?alt=media&token=c03a4464-44a2-4d86-9854-a4d8397f4815',
    link: 'https://go.minyvinyl.com/coomix',
    label: 'Featured Artist 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-edca1ab3-74b6-473b-a6f2-d2b9acc8606a.png?alt=media&token=d07e0600-0d7f-4f48-ba8b-c4259150b3cc',
    link: 'https://go.minyvinyl.com/lavosmix',
    label: 'Featured Artist 2'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6051bfd9-30c4-4ce4-8c01-ae2f27b211c2.png?alt=media&token=638bf1a0-1274-459c-92e6-e64640856020',
    link: 'https://go.minyvinyl.com/viepsamix',
    label: 'Featured Artist 3'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-866326cc-5c79-42ab-9411-a500a2c4ff66.png?alt=media&token=ba1ca12e-5512-466f-9880-3426dd92be5f',
    link: 'https://go.minyvinyl.com/thinkindie',
    label: 'Featured Curator 0'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-e0fc632e-b508-499e-a2b6-f408b9dc8e32.png?alt=media&token=37841e82-bd83-4d80-9ebd-3548ddb97683',
    link: 'https://go.minyvinyl.com/handpickinten',
    label: 'Featured Curator 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-686cc899-48b6-42bb-b474-77f05f668731.png?alt=media&token=b94c09b2-0894-430b-b622-a20bf912e5ca',
    link: 'https://go.minyvinyl.com/septpick',
    label: 'Featured Curator 2'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-eec8e305-dfba-4627-a9ea-4a1946306285.png?alt=media&token=aa3b1cda-e649-49e6-aead-4e6930ee5daf',
    link: 'https://go.minyvinyl.com/myllck24',
    label: 'Featured Curator 3'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-edca1ab3-74b6-473b-a6f2-d2b9acc8606a.png?alt=media&token=d07e0600-0d7f-4f48-ba8b-c4259150b3cc',
    link: 'https://go.minyvinyl.com/BedroomBeats',
    label: 'Featured Genre 0'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-4dbbf2a4-2e41-49f1-92d4-a926b3401477.png?alt=media&token=34592d00-8d90-44b1-a9a8-8ae4dbd5d754',
    link: 'https://go.minyvinyl.com/thealgorithm',
    label: 'Featured Genre 1'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-fbce2fc0-ae5b-4807-9700-59f796329157.png?alt=media&token=1dc8efb5-1509-4755-a919-ac3ea74f8e04',
    link: 'https://go.minyvinyl.com/BedroomBeats',
    label: 'Featured Genre 2' 
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-4b9e6096-635b-4bd1-8260-98f06d49b045.png?alt=media&token=22fed9ca-0ba7-4f8f-82cb-263cf5ed9fca',
    link: 'https://go.minyvinyl.com/sweetrap',
    label: 'Featured Genre 3'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-31eef8f3-77e1-4b43-971a-9c29c2480a57.png?alt=media&token=6af58e5d-a424-492d-a672-ab610dc5fc51',
    link: 'https://go.minyvinyl.com/tracyten',
    label: 'Live Performer 0'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-7ddab4da-ccc1-4ff7-83ce-43fa16301d19.png?alt=media&token=f9bab72e-6924-4868-8d60-29b710a6dd36',
    link: 'https://go.minyvinyl.com/djnicole',
    label: 'Live Performer 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-31eef8f3-77e1-4b43-971a-9c29c2480a57.png?alt=media&token=6af58e5d-a424-492d-a672-ab610dc5fc51',
    link: 'https://go.minyvinyl.com/tracyten',
    label: 'Live Performer 2'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6e402d96-8d3c-49ae-ba0b-4b151957d1d6.png?alt=media&token=3b8a2b00-8d6c-4021-9d07-fd246344c9b9',
    link: 'https://go.minyvinyl.com/julumixy',
    label: 'Live Performer 3'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-67de979a-bd8c-490c-b291-259856593f99.png?alt=media&token=6e4b969a-93fc-4867-b701-bb4ebb71f0c7',
    link: 'https://go.minyvinyl.com/afrodomini',
    label: 'Subway Musician 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-0d1d312c-1740-4d48-8e44-1b58fe62d1e6.png?alt=media&token=7a66df7d-678e-49a2-ba7c-2d3f884b4a57',
    link: 'https://go.minyvinyl.com/galdort',
    label: 'Subway Musician 2'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-93727014-df05-4553-86ef-15ad59ec27b0.png?alt=media&token=89e51498-ac38-4f54-83a7-7fb17df56e3c',
    link: 'https://go.minyvinyl.com/thebluedalhia',
    label: 'Subway Musician 3'
  },
   {
    imageUrl: 'https://minyfy.subwaymusician.xyz/6.png',
    link: 'https://minyfy.subwaymusician.xyz/play/75c2jQVezsGYkC5qS6TH',
    label: 'Subway Musician 4'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-edca1ab3-74b6-473b-a6f2-d2b9acc8606a.png?alt=media&token=d07e0600-0d7f-4f48-ba8b-c4259150b3cc',
    link: 'https://minyfy.subwaymusician.xyz/play/k0KjOatJ2lZG7oxQ83W6',
    label: 'Austin 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6051bfd9-30c4-4ce4-8c01-ae2f27b211c2.png?alt=media&token=638bf1a0-1274-459c-92e6-e64640856020',
    link: 'https://minyfy.subwaymusician.xyz/play/Y8gzr3Mid7DI0OqaRV73',
    label: 'Austin 2'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-5e21563c-987d-469b-a958-f5b38b876f72.png?alt=media&token=c03a4464-44a2-4d86-9854-a4d8397f4815',
    link: 'https://minyfy.subwaymusician.xyz/play/n7ff7fFKLVIRl7ITw8n2',
    label: 'Austin 3'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-edca1ab3-74b6-473b-a6f2-d2b9acc8606a.png?alt=media&token=d07e0600-0d7f-4f48-ba8b-c4259150b3cc',
    link: 'https://minyfy.subwaymusician.xyz/play/k0KjOatJ2lZG7oxQ83W6',
    label: 'Chicago 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6051bfd9-30c4-4ce4-8c01-ae2f27b211c2.png?alt=media&token=638bf1a0-1274-459c-92e6-e64640856020',
    link: 'https://minyfy.subwaymusician.xyz/play/Y8gzr3Mid7DI0OqaRV73',
    label: 'Chicago 2'
  },
   {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-5e21563c-987d-469b-a958-f5b38b876f72.png?alt=media&token=c03a4464-44a2-4d86-9854-a4d8397f4815',
    link: 'https://minyfy.subwaymusician.xyz/play/n7ff7fFKLVIRl7ITw8n2',
    label: 'Chicago 3'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-edca1ab3-74b6-473b-a6f2-d2b9acc8606a.png?alt=media&token=d07e0600-0d7f-4f48-ba8b-c4259150b3cc',
    link: 'https://minyfy.subwaymusician.xyz/play/k0KjOatJ2lZG7oxQ83W6',
    label: 'World 1'
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6051bfd9-30c4-4ce4-8c01-ae2f27b211c2.png?alt=media&token=638bf1a0-1274-459c-92e6-e64640856020',
    link: 'https://minyfy.subwaymusician.xyz/play/Y8gzr3Mid7DI0OqaRV73',
    label: 'World 2'
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
              className="w-full h-auto rounded-lg  transition-all duration-500 ease-in-out  hover:rotate-360"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      {renderImageSection("Top Mixtapes This Week", "Most popular tracks of the week", 0, 3)}
      {renderImageSection("Featured Artists", "Discover mixtapes from featured artists", 3, 6)}
      {renderImageSection("Featured Curators", "Discover mixtapes from the best curators", 7, 10)}
      {renderImageSection("Featured Genres", "Discover mixtapes by genre", 11, 14)}
{renderImageSection("Featured Live Performers", "Discover mixtapes from live performers", 15, 18)}
{renderImageSection("Featured Subway Musicians", "Discover mixtapes from subway musicians", 19, 22)}
{renderImageSection("Featured from New York", "Discover mixtapes from artists in New York", 23, 26)}
{renderImageSection("Featured from Austin, Texas", "Discover mixtapes from artists in Austin, Texas", 27, 30)}
{renderImageSection("Featured from Chicago", "Discover mixtapes from artists in Chicago", 31, 34)}

    </div>
  );
};

export default ImageGallery;
