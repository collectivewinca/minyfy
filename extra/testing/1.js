import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";
import { v4 as uuidv4 } from 'uuid';

const createCanvas = async (node) => {
  const canvas = await html2canvas(node, {
    useCORS: true,
    scale: 2,
    allowTaint: true,
    logging: false,
  });
  return canvas;
};

const drawHexagonClip = (context, width, height) => {
  const sideLength = Math.min(width, height) / 3;
  const hexHeight = sideLength * Math.sqrt(3) / 2;

  context.beginPath();
  context.moveTo(width / 2, 0);
  context.lineTo(width, hexHeight);
  context.lineTo(width, height - hexHeight);
  context.lineTo(width / 2, height);
  context.lineTo(0, height - hexHeight);
  context.lineTo(0, hexHeight);
  context.closePath();

  context.clip();
};

const MinySection = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const trackDataContainerRef = useRef(null);

  const backgroundImage = 'https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/images%2F2RTSHUOUitZKHPe5tHz3%2FPlaylist_Bg%20(1).png?alt=media&token=547b8aab-174b-468c-aa0e-4c6b7051888e';
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

  const handleUpload = async () => {
    if (trackDataContainerRef.current === null) return;

    try {
      const originalCanvas = await createCanvas(trackDataContainerRef.current);
      const width = originalCanvas.width;
      const height = originalCanvas.height;

      // Create a new offscreen canvas
      const hexCanvas = document.createElement("canvas");
      hexCanvas.width = width;
      hexCanvas.height = height;
      const hexContext = hexCanvas.getContext("2d");

      // Draw the hexagon clipping path
      drawHexagonClip(hexContext, width, height);

      // Draw the original canvas content into the hexagon-clipped canvas
      hexContext.drawImage(originalCanvas, 0, 0);

      // Convert the hexagon-clipped canvas to a Data URL
      const dataUrl = hexCanvas.toDataURL("image/png");

      // Convert Data URL to Blob
      const blob = await (await fetch(dataUrl)).blob();

      // Create a storage reference
      const fileName = `miny-${uuidv4()}.png`;
      const storageRef = ref(storage, `mixtapes/${fileName}`);

      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("Uploaded to Firebase Storage:", downloadUrl);
      setUploadedImageUrl(downloadUrl);
      setIsPopupOpen(true); // Open popup to show the uploaded image

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className='min-h-screen flex justify-center items-center border-none shadow-none'>
        <div className='py-7 md:w-[35%]'>
          <div ref={trackDataContainerRef} className='overflow-y-auto'>
            <div className="relative z-10 cursor-pointer hex-alt">
              <div className="overlay"></div>
              <img className="h-full w-full object-cover" src={backgroundImage} alt="Background" />

              <div className="absolute z-20 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2 w-full">
                <div className="flex flex-col md:gap-[5px] gap-1 items-end text-[2.8vw] md:text-[0.9vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
                  {tracks.map((track, index) => (
                    <div key={index} className="w-full text-right">
                      {toSentenceCase(track.length > 39 ? `${track.slice(0, 39)}..` : track)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute z-20 left-[8.5%] top-[21%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-30deg)", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                <div>TURN IT UP. MAKE IT A MINY MOMENT.</div>
              </div>

              <div
                className="absolute z-20 left-2 top-1/2 text-[1.7vw] md:text-[0.75vw] font-medium text-white origin-left"
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

              <div className="absolute z-20 left-[7%] bottom-[23%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(30deg)", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
                <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleUpload}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              Upload to Server
            </button>
          </div>
        </div>
      </div>

      {/* Popup for showing the uploaded image */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="relative py-4 overflow-y-auto">
            <button
              className="absolute top-0 right-0 mt-2 mr-2 text-white text-3xl"
              onClick={() => setIsPopupOpen(false)}
            >
              &times;
            </button>
            {uploadedImageUrl && (
              <img src={uploadedImageUrl} alt="Uploaded Mixtape" className="h-[100vh] w-full object-contain" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MinySection;
