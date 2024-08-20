import React, { useRef, useState, useEffect } from 'react';
import { toSvg, toCanvas } from 'html-to-image'; // Import both toSvg and toCanvas
import download from 'downloadjs';
import { FaDownload } from "react-icons/fa6";

const createCanvas = async (node) => {
  const isSafariOrChrome = /safari|chrome/i.test(navigator.userAgent) && !/android/i.test(navigator.userAgent);

  let dataUrl = "";
  let canvas;
  let i = 0;
  let maxAttempts = isSafariOrChrome ? 5 : 1;
  let cycle = [];
  let repeat = true;

  while (repeat && i < maxAttempts) {
    canvas = await toCanvas(node, {
      fetchRequestInit: {
        cache: "no-cache",
      },
      includeQueryParams: true,
      quality: 1,
    });
    i += 1;
    dataUrl = canvas.toDataURL("image/png");
    cycle[i] = dataUrl.length;

    if (dataUrl.length > cycle[i - 1]) repeat = false;
  }
  console.log("is safari or chrome:" + isSafariOrChrome + "_repeat_need_" + i);
  return canvas;
};

const MinySection = () => {
  const trackDataContainerRef = useRef(null);


 

  const backgroundImage = 'https://minyfy.subwaymusician.xyz/6.png';
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
  ];
  const name = 'Daniel Daniel';
  const topValue = 38 - name.length * 0.4;

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  const handleDownload = async () => {
    if (trackDataContainerRef.current === null) {
      return;
    }

    try {
      const canvas = await createCanvas(trackDataContainerRef.current);
      const dataUrl = canvas.toDataURL("image/png");
      download(dataUrl, 'my-miny-order.png');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className='min-h-screen flex justify-center items-center'>
        <div className='py-7 md:w-[35%]'>
          <div ref={trackDataContainerRef} className='overflow-y-auto'>
            <div className="relative z-10 cursor-pointer hex-alt">
              <div className="overlay"></div>
              <img  className="w-full h-full object-cover" src={backgroundImage} alt="Background"  />
              
              <div className="absolute top-1/2 z-10 right-0 transform -translate-y-1/2 md:pr-1 pr-2 w-full">
                <div className="flex flex-col md:gap-[5px] gap-1 items-end text-[2.8vw] md:text-[0.9vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
                  {tracks.map((track, index) => (
                    <div key={index} className="w-full text-right">
                      {toSentenceCase(track.length > 39 ? `${track.slice(0, 39)}..` : track)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="absolute left-[8.5%] z-10 top-[21%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-30deg)", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                <div>TURN IT UP. MAKE IT A MINY MOMENT.</div>
              </div>
              
              <div 
                className="absolute left-2 top-1/2 z-10 text-[1.7vw] md:text-[0.75vw] font-medium text-white origin-left"
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
              
              <div className="absolute left-[7%] z-10 bottom-[22%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(30deg)", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
              </div>
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
