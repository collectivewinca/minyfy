import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { mixtapeCollectionName, votesCollectionName } = req.body;

  if (!mixtapeCollectionName || !votesCollectionName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Fetch all documents from both collections
    const mixtapesRef = collection(db, mixtapeCollectionName);
    const votesRef = collection(db, votesCollectionName);
    
    const mixtapesSnapshot = await getDocs(mixtapesRef);
    const votesSnapshot = await getDocs(votesRef);

    // Create a map to store votes data by document ID for quick access
    const votesMap = {};
    votesSnapshot.docs.forEach(doc => {
      votesMap[doc.id] = doc.data();
    });

    let updatedDocs = 0;

    // Iterate through the mixtapes documents
    for (const mixtapeDoc of mixtapesSnapshot.docs) {
      const mixtapeId = mixtapeDoc.id; // Use the mixtape document ID
      const votesData = votesMap[mixtapeId]; // Retrieve matching votes data

      // Only update if there's a corresponding votes document
      if (votesData) {
        // Prepare the updates based on the structure provided
        const updates = {
          voteCount: votesData.voteCount || 0, // Default to 0 if not present
          votedBy: votesData.votedBy || [] // Default to an empty array if not present
        };

        await updateDoc(mixtapeDoc.ref, updates);
        console.log(`Document ${mixtapeId} updated with votes data:`, updates);
        updatedDocs++;
      } else {
        console.log(`No matching votes found for mixtape document ${mixtapeId}, skipping.`);
      }
    }

    return res.status(200).json({ message: `Processed all documents. Updated ${updatedDocs} documents.` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process and update documents", details: error.message });
  }
}
