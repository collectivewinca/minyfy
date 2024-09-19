// pages/api/checkAllDocuments.js
import { collection, getDocs, updateDoc, Timestamp } from "firebase/firestore";
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
    // Get a reference to the collection
    const collectionRef = collection(db, collectionName);
    
    // Get all documents in the collection
    const querySnapshot = await getDocs(collectionRef);

    let updatedDocs = 0;
    
    // Iterate over each document in the collection
    querySnapshot.forEach(async (docSnapshot) => {
      const docData = docSnapshot.data();
      console.log(`Processing document ${docSnapshot.id}`);

      if (!docData.createdAt) {
        // Create a Firestore Timestamp with specific seconds and nanoseconds
        const customTimestamp = new Timestamp(1724239452, 63000000); // Example timestamp

        // Update the document with the new createdAt field
        await updateDoc(docSnapshot.ref, {
          createdAt: customTimestamp
        });
        console.log(`Document ${docSnapshot.id} updated`);

        updatedDocs++;
      }
    });

    return res.status(200).json({ message: `Processed all documents. Updated ${updatedDocs} documents.` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch and update documents", details: error.message });
  }
}
