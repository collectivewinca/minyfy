import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '@/firebase/config';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/Header';


function Admin() {
  const [user, setUser] = useState(null);
  const [mixtapes, setMixtapes] = useState([]);
  const router = useRouter();
  const adminEmails = ['labh@collectivewin.ca', 'hello@collectivewin.ca'];

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

  if (!user) {
    return null;
  }

  return (
    <>
    <Header />
    <div className="container mx-5 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>
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
              <td className="py-2 px-4 border-b underline cursor-pointer" onClick={() => window.open(`/play/${mixtape.id}`, '_blank')} >Visit</td>
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
