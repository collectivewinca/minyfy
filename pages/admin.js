import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { db, auth, storage } from '@/firebase/config';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Header from '@/components/Header';

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
  const adminEmails = ['labh@collectivewin.ca', 'hello@collectivewin.ca', "alet@myblackbean.ca",
    "subwaymusicianxyz@gmail.com",
    "divya@collectivewin.ca"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminEmails.includes(user.email)) {
        setUser(user);
        fetchMixtapes();
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "mixtapes", id));
      setMixtapes(mixtapes.filter(mixtape => mixtape.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleUrlSubmit = async () => {
    const docID = docId.split('/').pop();
    try {
      const docRef = doc(db, "mixtapes", docID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setError('');
        // Allow user to upload image
        if (selectedFile) {
          setUploading(true);
          const storageRef = ref(storage, `images/${docID}/${selectedFile.name}`);
          await uploadBytes(storageRef, fileBlob);
          const downloadURL = await getDownloadURL(storageRef);

          // Update the document with the new background image URL
          await updateDoc(docRef, { backgroundImage: downloadURL });

          // Clear the input fields
          setDocId('');
          setSelectedFile(null);
          setFileBlob(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setUploading(false);
          alert('Background image updated successfully!');
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
      <div className="container mx-5 mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>
        <h1 className="text-lg font-bold mb-1">Use link like https://minyfy.subwaymusician.xyz/play/JLoRn9KQkc73B7ELFZCB</h1>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter URL"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            className="border px-4 py-2"
          />
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="border px-4 py-2 ml-2"
          />
          <button
            onClick={handleUrlSubmit}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Link</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">User Email</th>
              <th className="py-2 px-4 border-b">Image Url</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mixtapes.map((mixtape) => (
              <tr key={mixtape.id}>
                <td className="py-2 px-4 border-b underline cursor-pointer" onClick={() => window.open(`/play/${mixtape.id}`, '_blank')}>Visit</td>
                <td className="py-2 px-4 border-b">{mixtape.name}</td>
                <td className="py-2 px-4 border-b">{mixtape.date}</td>
                <td className="py-2 px-4 border-b">{mixtape.userEmail}</td>
                <td className="py-2 px-4 border-b underline cursor-pointer"><a href={mixtape.imageUrl} target="_blank">view</a></td>
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
    </>
  );
}

export default Admin;
