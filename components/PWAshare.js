import React, { useState, useEffect } from 'react';
import { IoMdShare } from "react-icons/io";

const PWAShare = ({ title, text, url, imageUrl }) => {
  const [isPWA, setIsPWA] = useState(false);
  const [shareResult, setShareResult] = useState('');

  useEffect(() => {
    // Check if the app is running as a PWA
    const checkIfPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      setIsPWA(isStandalone || isFullscreen);
    };

    checkIfPWA();
    window.addEventListener('resize', checkIfPWA);

    return () => {
      window.removeEventListener('resize', checkIfPWA);
    };
  }, []);

  const shareContent = async () => {
    if (navigator.share) {
      try {
        const shareData = { title, text, url };

        if (imageUrl) {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: blob.type });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }

        await navigator.share(shareData);
        setShareResult('Content shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        setShareResult('Error sharing content');
      }
    } else {
      setShareResult('Web Share API not supported on this browser');
    }
  };

  if (!isPWA) {
    return null; // Don't render anything if not running as a PWA
  }

  return (
    <div className=" flex justify-center">
      <button 
        className="bg-lime-400 text-white p-2 rounded-full shadow-lg hover:bg-lime-800 transition duration-300 flex items-center justify-center"
        onClick={shareContent}
      >
        <IoMdShare className="text-2xl" />
      </button>
    </div>
  );
};

export default PWAShare;
