import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth, storage } from '@/firebase/config';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import html2canvas from 'html2canvas';
import { toCanvas } from 'html-to-image';

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
      skipFonts: true,
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

function Admin() {
  const [user, setUser] = useState(null);
  const [mixtapes, setMixtapes] = useState([]);
  const [docId, setDocId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const trackDataContainerRef = useRef(null);

  const [backgroundImage, setBackgroundImage] = useState('https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/images%2F2RTSHUOUitZKHPe5tHz3%2FPlaylist_Bg%20(1).png?alt=media&token=547b8aab-174b-468c-aa0e-4c6b7051888e');
  const [tracks, setTracks] = useState([]);
  const [name, setName] = useState('');

  const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  };

  console.log("Minys:", mixtapes.map(({ tracks, ...rest }) => rest));


  const handleDelete = async (mixtapeId) => {
    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, 'mixtapes', mixtapeId));

      // Remove the deleted mixtape from the state
      setMixtapes(mixtapes.filter((mixtape) => mixtape.id !== mixtapeId));

    } catch (error) {
      console.error('Error deleting mixtape:', error);
      alert('Failed to delete mixtape.');
    }
  };

  const adminEmails = [
    'labh@collectivewin.ca',
    'hello@collectivewin.ca',
    "alet@myblackbean.ca",
    "subwaymusicianxyz@gmail.com",
    "divya@collectivewin.ca"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminEmails.includes(user.email)) {
        setUser(user);
        fetchMixtapes(); // Fetch mixtapes once when the user is authenticated
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMixtapes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "mixtapes"));
      const mixtapesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort mixtapesData by date
      mixtapesData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMixtapes(mixtapesData);
    } catch (error) {
      console.error("Error fetching mixtapes: ", error);
    }
  };

  const findMixtapeById = (docID) => {
    return mixtapes.find(mixtape => mixtape.id === docID);
  };

  const uploadImage = async () => {
    if (trackDataContainerRef.current === null) return;
    try {
      const canvas = await createCanvas(trackDataContainerRef.current);
      const dataUrl = canvas.toDataURL("image/png");

      const webpDataUrl = canvas.toDataURL("image/webp", 0.8); 

        // Convert the WebP Data URL to Blob
        const webpBlob = await (await fetch(webpDataUrl)).blob();
      
      // Convert Data URL to Blob
      const blob = await (await fetch(dataUrl)).blob();
      
      // Create a storage reference
      const fileName = `miny-${uuidv4()}`;
      const imageRef = ref(storage, `aminy-generation/${fileName}`);
      
      // Upload the blob to Firebase Storage
      await uploadBytes(imageRef, webpBlob);
  
      const imageUrl = await getDownloadURL(imageRef);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
  };

  const handleUrlSubmit = async () => {
    const docID = docId.split('/').pop();
    const mixtape = findMixtapeById(docID);
  
    if (!mixtape) {
      setError('Mixtape not found.');
      return;
    }
  
    setTracks(mixtape.tracks || []);
    setName(mixtape.name || '');
  
    try {
      const docRef = doc(db, "mixtapes", docID);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        setError('');
        if (selectedFile) {
          setUploading(true);
  
          // Create a function to convert the image file to WebP format
          const convertToWebP = async (file) => {
            const imageBitmap = await createImageBitmap(file);
            const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0);
  
            // Convert the canvas content to a WebP Blob
            const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 });
            return webpBlob;
          };
  
          // Convert the selected image file to WebP
          const webpBlob = await convertToWebP(selectedFile);
  
          // Now upload the WebP Blob to Firebase Storage
          const storageRef = ref(storage, `images/${docID}/${selectedFile.name}.webp`);
          await uploadBytes(storageRef, webpBlob);
  
          const downloadURL = await getDownloadURL(storageRef);
  
          setBackgroundImage(downloadURL || '');
  
          const screenshotUrl = await uploadImage(); // Screenshot URL
  
          // Update the document with the new background image and screenshot URL
          await updateDoc(docRef, {
            backgroundImage: downloadURL,
            imageUrl: screenshotUrl // Store the screenshot URL in Firestore
          });
  
          setDocId('');
          setSelectedFile(null);
          setFileBlob(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setUploading(false);
          alert('Background image and screenshot updated successfully!');
        } else {
          setError('Please select a file to upload.');
        }
      } else {
        setError('Document not found.');
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      setError('Error updating document.');
      setUploading(false);
    }
  };
  

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileBlob(e.target.files[0]);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-5 mt-5">
        <h1 className="text-3xl font-bold mb-3 text-center">Admin Panel</h1>
        
        <div className='flex gap-2 justify-center items-center ' >
          <h1
            onClick={()=>{router.push('/admin/tags')}}
            className={`bg-lime-500 flex justify-center cursor-pointer items-center text-center hover:bg-lime-700 text-white font-bold w-44 py-2 px-4 rounded `}
          >
            Create Tags
          </h1>
          <h1
            onClick={()=>{router.push('/admin/blog')}}
            className={`bg-lime-500 flex justify-center cursor-pointer items-center text-center hover:bg-lime-700 text-white font-bold w-44 py-2 px-4 rounded `}
          >
            Create Blog
          </h1>
        
        </div>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Enter URL"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            className="border px-4 py-3"
          />
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="border px-4 py-2 ml-2"
          />
          <button
            onClick={handleUrlSubmit}
            className={`bg-blue-500 hover:bg-blue-700 cursor-pointer  text-white font-bold py-2 px-4 ml-2 rounded ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <h1 className="text-xs font-semibold mb-1">Use link like https://minyfy.subwaymusician.xyz/play/JLoRn9KQkc73B7ELFZCB</h1>
        

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Link</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">User Email</th>
              <th className="py-2 px-4 border-b">Image Url</th>
              <th className="py-2 px-4 border-b">Bg Url</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mixtapes.map((mixtape) => (
              <tr key={mixtape.id}>
                <td className="py-2 px-4 border-b underline cursor-pointer" onClick={() => window.open(`https://minyfy.subwaymusician.xyz/play/${mixtape.id}`, '_blank')}>Visit</td>
                <td className="py-2 px-4 border-b">{mixtape.name.toUpperCase()}</td>
                <td className="py-2 px-4 border-b">{mixtape.date}</td>
                <td className="py-2 px-4 border-b">{mixtape.userEmail}</td>
                <td className="py-2 px-4 border-b underline cursor-pointer"><a href={mixtape.imageUrl} target="_blank">view</a></td>
                <td className="py-2 px-4 border-b underline cursor-pointer"><a href={mixtape.backgroundImage} target="_blank">view</a></td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDelete(mixtape.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
          
          <div className="md:w-[40%] mx-auto">
          {backgroundImage && tracks && (<>
              <div ref={trackDataContainerRef} className='overflow-y-auto'>
                  <div className="relative z-10 cursor-pointer hex-alt">
                    <div className="overlay"></div>
                    <img className="h-full w-full object-cover" src={backgroundImage} alt="Background" />

                    <div className="absolute z-20 top-1/2 right-0 transform -translate-y-1/2 md:pr-1 pr-2 w-full">
                      <div className="flex flex-col md:gap-[6px] gap-[3.5px] items-end text-[2.1vw] md:text-[1vw] font-wittgenstein font-base md:px-3 px-2 text-neutral-300 tracking-wider">
                        {tracks.map((track, index) => (
                          <div key={index} className="w-full text-right">
                            {toSentenceCase(track.track.length > 35 ? `${track.track.slice(0, 35)}..` : track.track)}
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
                        top: `${42 - name.length * 0.45}%`,
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
            
            </>)}
          </div>
      
      
      
      
    </>
  );
}

export default Admin;
