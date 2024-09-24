import sharp from 'sharp';
import fetch from 'node-fetch';
import {  ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {storage} from '@/firebase/config';

export default async function handler(req, res) {
  const { imageUrl } = req.body;

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to WebP using Sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 }) // Adjust quality as needed
      .toBuffer();

    // Upload to Firebase Storage
    const storageRef = ref(storage, `generated-images/${Date.now()}.webp`);
    await uploadBytes(storageRef, webpBuffer);

    // Get the Firebase Storage URL
    const firebaseUrl = await getDownloadURL(storageRef);

    res.status(200).json({ firebaseUrl });
  } catch (error) {
    console.error('Server-side processing error:', error);
    res.status(500).json({ error: 'Image processing failed' });
  }
}