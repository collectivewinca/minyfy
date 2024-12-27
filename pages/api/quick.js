import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { collectionName } = req.query;

  if (!collectionName) {
    return res.status(400).json({ error: "Missing required query parameter: collectionName" });
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

      // Check if backgroundImage exists and contains "subwaymusician.xyz"
      if (docData.backgroundImage && docData.backgroundImage.includes("subwaymusician.xyz")) {
        const newBackgroundImage = docData.backgroundImage.replace("subwaymusician.xyz", "minyvinyl.com");
        updates.backgroundImage = newBackgroundImage;
      }

      // If the backgroundImage is updated, update the document in Firestore
      if (Object.keys(updates).length > 0) {
        await updateDoc(docSnapshot.ref, updates);
        updatedDocs++;
      }
    }

    return res.status(200).json({ message: `${updatedDocs} documents updated successfully` });

  } catch (error) {
    console.error("Error updating documents:", error);
    return res.status(500).json({ error: "Failed to update documents" });
  }
}
