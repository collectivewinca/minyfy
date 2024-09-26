import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

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

    // Iterate through each document in the collection
    for (const docSnapshot of querySnapshot.docs) {
      const docData = docSnapshot.data();
      console.log(`Processing document ${docSnapshot.id}`);

      const updates = {};

      // Check if commentCount exists, if not, calculate and set it
      if (docData.commentCount === undefined) {
        if (Array.isArray(docData.comments)) {
          updates.commentCount = docData.comments.length; // Set to the length of the comments array
        } else {
          updates.commentCount = 0; // Set to 0 if comments field doesn't exist or is not an array
        }
      }

      // If there are any updates, apply them
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
