import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageSlider = ({ interval = 8000 }) => {
  const images = [
    '/miny1.jpg',
    '/miny2.jpg',
    '/miny3.jpg',
    '/miny4.jpg',
    '/9.png',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [interval, images.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative md:w-[50%] w-full flex justify-center items-center h-[19rem] md:h-[18rem] overflow-hidden bg-transparent">
      <div className="absolute inset-0 flex items-center rounded-xl justify-center">
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
      </div>



      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-[1px] md:left-4 transform -translate-y-1/2 text-2xl  hover:text-[#00dc04c1]  text-[#00dc04] md:p-2 rounded-full"
      >
        ◀
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-[1px] md:right-4 transform -translate-y-1/2 text-2xl  hover:text-[#00dc04c1]  text-[#00dc04] md:p-2 rounded-full"
      >
        ▶
      </button>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={`w-2 h-2 p-[2px]  rounded-full ${
              index === currentIndex ? 'bg-[#00dc04] ' : 'bg-gray-200 '
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;