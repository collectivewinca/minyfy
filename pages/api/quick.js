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

    for (const docSnapshot of querySnapshot.docs) {
      const docData = docSnapshot.data();
      console.log(`Processing document ${docSnapshot.id}`);

      const updates = {};

      // Handle name field: convert it to lowercase
      if (docData.name) {
        const lowercaseName = docData.name.toLowerCase();
        if (lowercaseName !== docData.name) {
          updates.name = lowercaseName;
        }
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
