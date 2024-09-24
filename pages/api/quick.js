import { collection, getDocs, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import axios from 'axios';
import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { collectionName } = req.body;

  if (!collectionName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    let updatedDocs = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const docData = docSnapshot.data();
      console.log(`Processing document ${docSnapshot.id}`);

      const updates = {};
      
      // Safely handle cases where there are fewer than 4 tracks
      const tracks = docData.tracks || [];  // Default to an empty array if tracks field doesn't exist
      const trackNames = tracks.slice(0, 4).map(t => t.track).join(' - ');

      // Create a new name using the tracks (ensure trackNames is not empty)
      const newImageName = trackNames
        ? `Miny Vinyl Playlist (Mixtape) featuring tracks - ${trackNames}`
        : `Miny Vinyl Playlist (Mixtape)`;  // Fallback if there are no track names

      // Replace spaces with hyphens
      const sanitizedImageName = newImageName.replace(/\s+/g, '-');

      // Check if backgroundImage is a local path (starting with "/") and skip processing if true
      if (docData.backgroundImage && !docData.backgroundImage.startsWith('/')) {
        const newBackgroundImageUrl = await processAndUploadImage(docData.backgroundImage, docSnapshot.id, 'background', sanitizedImageName);
        if (newBackgroundImageUrl) {
          updates.backgroundImage = newBackgroundImageUrl;
        }
      } else {
        console.log(`Skipped local backgroundImage for document ${docSnapshot.id}`);
      }

      // Check if imageUrl is a local path (starting with "/") and skip processing if true
      if (docData.imageUrl && !docData.imageUrl.startsWith('/')) {
        const newImageUrl = await processAndUploadImage(docData.imageUrl, docSnapshot.id, 'image', sanitizedImageName);
        if (newImageUrl) {
          updates.imageUrl = newImageUrl;
        }
      } else {
        console.log(`Skipped local imageUrl for document ${docSnapshot.id}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(docSnapshot.ref, updates);
        console.log(`Document ${docSnapshot.id} updated`);
        updatedDocs++;
      }
    }

    return res.status(200).json({ message: `Processed all documents. Updated ${updatedDocs} documents.` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process and update documents", details: error.message });
  }
}

async function processAndUploadImage(imageUrl, docId, imageType, imageName) {
  try {
    // Determine the image name based on the imageType
    const finalImageName = imageType === 'image' 
      ? imageName.replace(/\s+/g, '-')  
      : `${docId}-${imageType}.webp`;   // Use "docId-imageType.webp" for background images

    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Convert to WebP
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Use the final image name determined above
    const storageRef = ref(storage, `a-mixtapes/${finalImageName}`);
    await uploadBytes(storageRef, webpBuffer);

    // Get the download URL
    const newUrl = await getDownloadURL(storageRef);

    console.log(`Processed and uploaded ${imageType} for document ${docId} with name ${finalImageName}`);
    return newUrl;
  } catch (error) {
    console.error(`Error processing ${imageType} for document ${docId}:`, error);
    return null;
  }
}
