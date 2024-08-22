// pages/api/save-image.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, backgroundImage, tracks, user, isFavorite, date } = req.body;

    if (!name || !tracks || !user) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Render the HTML template with the provided data
    const html = renderTemplate(tracks, name, backgroundImage);

    // Capture the image using Puppeteer
    const imageBuffer = await captureImage(html);

    // Create a unique file name
    const fileName = `miny-${uuidv4()}.png`;
    const imageRef = ref(storage, `aminy-generation/${fileName}`);

    // Upload the image to Firebase storage
    await uploadBytes(imageRef, imageBuffer, { contentType: 'image/png' });

    // Get the download URL
    const imageUrl = await getDownloadURL(imageRef);

    // Save to Firestore
    const docRef = await addDoc(collection(db, "mixtapes"), {
      name,
      backgroundImage,
      tracks,
      date,
      isFavorite,
      userDisplayName: user.displayName || 'Anonymous',
      userEmail: user.email,
      imageUrl,
    });

    res.status(200).json({ message: 'Image saved successfully', imageUrl, docId: docRef.id });
  } catch (error) {
    console.error("Error saving image: ", error);
    res.status(500).json({ message: 'Error saving image', error });
  }
}

async function captureImage(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const buffer = await page.screenshot({ type: 'png' });
  await browser.close();
  return buffer;
}

function renderTemplate(tracks, name, backgroundImage) {
  return `
<div  className='overflow-y-auto'>
  <div className="relative z-10 cursor-pointer hex-alt">
    <div className="overlay"></div>
    <img className="w-full h-full object-cover" src="${backgroundImage}" alt="Background" />
    <div className="absolute z-10 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2 w-full">
      <div className="flex flex-col md:gap-[6px] gap-[3.5px] items-end text-[2.4vw] md:text-[0.9vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
        ${tracks.map((track) => `
          <div className="w-full text-right">
            ${toSentenceCase(track.length > 33 ? `${track.slice(0, 33)}..` : track)}
          </div>
        `).join('')}
      </div>
    </div>
    <div className="absolute z-10 left-[8.5%] top-[21.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform -rotate-30 origin-top-left" style={{ transform: "rotate(-30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
      <div>TURN IT UP. MAKE IT A MINY MOMENT.</div>
    </div>
    <div className="absolute z-10 left-2 top-1/2 text-[1.7vw] md:text-[0.75vw] font-medium text-white origin-left" style={{ top: '38%', transform: "translateY(-50%) rotate(-90deg) translateX(-100%)", transformOrigin: "", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
      <div className="whitespace-nowrap">
        MINY MIXTAPE : <strong className='text-[#f48531] ml-1 uppercase'>${name}</strong>
      </div>
    </div>
    <div className="absolute z-10 left-[7%] bottom-[22.5%] text-[1.7vw] md:text-[0.75vw] font-medium text-white transform rotate-30 origin-bottom-left" style={{ transform: "rotate(30deg) ", textShadow: "2px 3px 3px rgba(0, 0, 0, 0.3)" }}>
      <div>MINYVINYL.COM | SUBWAYMUSICIAN.XYZ</div>
    </div>
  </div>
</div>
`;
}

function toSentenceCase(str) {
  return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}