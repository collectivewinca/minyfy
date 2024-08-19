  import React, { useRef, useState, useEffect } from 'react';
  import { toPng } from 'html-to-image';
  import download from 'downloadjs';
  import { FaDownload, FaHeart, FaRegHeart } from "react-icons/fa6";
  import Marquee from "react-fast-marquee";



  
  

  const MinySection = () => {
    const [isFavorite, setIsFavorite] = useState(true);
    const trackDataContainerRef = useRef(null);
    const [width, setWidth] = useState(null);
    useEffect(() => {
      const handleResize = () => {
        const width = window.innerWidth;
        setWidth(width);
        
      };
      
      // Set initial values
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    const backgroundImage = '/gallery/img4.png'
    const tracks = [
      "A Bar Song (Tipsy) - Shaboozey",
      "I Had Some Help (Feat. Morgan Wallen) - Post Malone",
      "Pink Skies - Zach Bryan",
      "It'S Up - Drake, Young Thug & 21 Savage",
      "BIRDS OF A FEATHER - Billie Eilish",
      "Blue Green Red - Drake",
      "Lies Lies Lies - Morgan Wallen",
      "Not Like Us - Kendrick Lamar",
      "28 - Zach Bryan",
      "Beautiful Things - Benson Boone"
    ]
    const name = 'Daniel Daniel'
    const topValue = 38 - name.length * 0.4;
    
    const toSentenceCase = (str) => {
      return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    };

    const handleDownload = () => {
      if (trackDataContainerRef.current === null) {
        return
      }

      toPng(trackDataContainerRef.current, { cacheBust: true, })
        .then((dataUrl) => {
          download(dataUrl, 'my-miny-order.png');
        })
        .catch((err) => {
          console.log(err)
        })
    }
    return (
      <>
      <div className='min-h-screen flex justify-center items-center'>
      <div className='py-7 md:w-[35%]'>
      <Marquee gradient={true} gradientWidth={20} speed={40} pauseOnHover={true}>
      This is a long sentence that will move from left to right.</Marquee>
        <div ref={trackDataContainerRef} className='overflow-y-auto'>
        <div className="relative z-10 cursor-pointer hex-alt">
          <div className="overlay"></div>
          <img className="h-full w-full " src={backgroundImage} alt="Background" />
          
          {/* Top center - Logo */}
          {/* <div className="absolute top-3 left-1/2 transform -translate-x-1/2 mt-4 ml-2">
            <p className="text-white font-medium text-lg tracking-wide">
              <img src="/stamp.png" alt="Minyfy Logo" className="md:h-[8vh] h-[4vh] md:px-2  px-2" />
            </p>
          </div> */}
          
          {/* Right center - Tracks */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2 w-full">
            <div className="flex flex-col md:gap-[5px] gap-1 items-end text-[2.8vw] md:text-[0.9vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
              {tracks.map((track, index) => (
                <div key={index} className="w-full text-right">
                  {toSentenceCase(track.length > 39 ? `${track.slice(0, 39)}..` : track)}
                </div>
              ))}
            </div>
          </div>
                    
          <div className="absolute left-[8.5%] top-[21%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-26.5deg)", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
              <div>TURN IT UP. MAKE IT A MINY MOMENT.</div>
            </div>
            
            {/* Middle-left text */}
            <div 
                      className="absolute left-2 top-1/2 text-[1.7vw] md:text-[0.75vw] font-medium text-white origin-left"
                      style={{ 
                        top: `${topValue}%`,
                        transform: "translateY(-50%) rotate(-90deg) translateX(-100%)",
                        transformOrigin: "",
                        textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)"
                      }}
                    >
                      <div className="whitespace-nowrap">
                        MINY MIXTAPE :
                        <strong className='text-[#f48531] ml-1 uppercase'>{name}</strong>
                      </div>
                    </div>
            {/* Bottom-left text */}
            <div className="absolute left-[7%] bottom-[22%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(26.5deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
              <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
            </div>

          
          {/* Bottom center - Name */}
          {/* <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 mb-4">
            <div className="flex flex-col items-center md:text-xs text-[0.6rem] font-serif font-base md:px-4 px-2 text-neutral-300 tracking-wider">
              <p><strong className='text-[#f48531] mb-3'>{name}'s</strong></p>
              <p>MINY Order</p>
            </div>
          </div> */}
          
          
        </div>
          
        </div>
        <div className="mt-4 flex justify-center">
            <button 
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaDownload className="mr-2" /> Download Image
            </button>
          </div>
      </div>

      </div>
      
      </>
    );
  };

  export default MinySection;
