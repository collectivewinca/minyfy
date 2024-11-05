import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  getFirestore,
} from "firebase/firestore";
import { app } from "@/firebase/config"; // Import the app initialization
import Image from "next/image";
import Header from "@/components/Header";

const db = getFirestore(app); // Initialize Firestore with the app

const MixtapesCopy = () => {
  const [mixtapes, setMixtapes] = useState([]);
  const [selectedMixtapes, setSelectedMixtapes] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMixtapes = async () => {
    setLoading(true);
    try {
      const mixtapesRef = collection(db, "mixtapes");
      let q;

      if (lastVisible) {
        q = query(
          mixtapesRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(50)
        );
      } else {
        q = query(mixtapesRef, orderBy("createdAt", "desc"), limit(50));
      }

      const querySnapshot = await getDocs(q);
      const newMixtapes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMixtapes((prev) => (lastVisible ? [...prev, ...newMixtapes] : newMixtapes));  // Conditionally spread previous mixtapes
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (error) {
      console.error("Error fetching mixtapes:", error);
    } finally {
      setLoading(false); // Ensure loading is set to false even if there's an error
    }
  };

  useEffect(() => {
    fetchMixtapes();
  }, []);

  // Toggle selection of mixtapes
  const toggleSelectMixtape = (mixtape) => {
    setSelectedMixtapes((prev) =>
      prev.some((item) => item.id === mixtape.id)
        ? prev.filter((item) => item.id !== mixtape.id)
        : [...prev, mixtape]
    );
  };

  // Unselect all mixtapes
  const unselectAll = () => {
    setSelectedMixtapes([]);
  };

  // Copy selected mixtapes as JSON
  const copySelectedAsJSON = () => {
    const selectedData = selectedMixtapes.map(({ name, imageUrl, shortenedLink }) => ({
      name,
      imageUrl,
      shortenedLink,
    }));
    navigator.clipboard.writeText(JSON.stringify(selectedData, null, 2));

    // Set copied state to true, then reset after 3 seconds
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Component */}
      <Header />

      <h1 className="text-2xl font-bold my-4 text-center">Mixtapes</h1>

      {/* Selection Count, Copy Button, and Unselect All Button */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600">
          Selected: {selectedMixtapes.length}
        </span>

        <div className="flex gap-2">
          <button
            onClick={copySelectedAsJSON}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400"
            disabled={selectedMixtapes.length === 0}
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            onClick={unselectAll}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-400"
            disabled={selectedMixtapes.length === 0}
          >
            Unselect All
          </button>
        </div>
      </div>

      {/* Mixtapes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mixtapes.map((mixtape) => {
          const isSelected = selectedMixtapes.some((item) => item.id === mixtape.id);
          return (
            <div
              key={mixtape.id}
              onClick={() => toggleSelectMixtape(mixtape)}
              className={`p-4 rounded shadow-md cursor-pointer transition transform ${
                isSelected ? "bg-blue-100 border-blue-500 border-2" : "bg-white"
              }`}
            >
              <div className="mb-2">
                <Image
                  src={mixtape.imageUrl}
                  alt={mixtape.name}
                  width={300}
                  height={300}
                  className="object-contain mx-auto"
                  quality={80}
                  priority
                />
              </div>
              <h2 className="text-lg uppercase font-semibold text-center">{mixtape.name}</h2>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {loading ? (
        <p className="text-center my-4">Loading...</p>
      ) : (
        <button
          onClick={fetchMixtapes}
          className="block mx-auto mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default MixtapesCopy;
