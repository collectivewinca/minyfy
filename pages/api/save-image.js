// pages/api/saveImage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db,storage } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageData, name, backgroundImage, tracks, user, isFavorite, date } = req.body;

    if (!imageData || !name || !tracks || !user) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert base64 string to a buffer
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a unique file name
    const fileName = `miny-${uuidv4()}.png`;
    const imageRef = ref(storage, `aminy-generation/${fileName}`);

    // Upload the buffer as a file
    await uploadBytes(imageRef, buffer, { contentType: 'image/png' });

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
