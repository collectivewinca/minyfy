import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { FaTrash } from 'react-icons/fa'; // Import the trash icon from react-icons
import Header from '@/components/Header';

export default function Tags() {
  const [mixtapes, setMixtapes] = useState([]);
  const [tagName, setTagName] = useState('');
  const [selectedMixtapes, setSelectedMixtapes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggingTagIndex, setDraggingTagIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        await Promise.all([fetchMixtapes(), fetchTags()]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
      }
    };

    fetchData();
  }, []);

  const fetchMixtapes = async () => {
    const q = query(collection(db, 'mixtapes'), orderBy('createdAt', 'desc'), limit(150));
    const querySnapshot = await getDocs(q);
    const mixtapesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMixtapes(mixtapesData);
  };

  const fetchTags = async () => {
    const q = query(collection(db, 'tags'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const tagsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTags(tagsData);
  };

  const handleTagCreation = async (e) => {
    e.preventDefault();
    if (tagName && selectedMixtapes.length > 0) {
      try {
        const newTag = {
          tagName: tagName,
          selectedMixtapes: selectedMixtapes,
          order: tags.length,
        };
        await addDoc(collection(db, 'tags'), newTag);
        alert('Tag created successfully!');
        setTagName('');
        setSelectedMixtapes([]);
        await fetchTags();
      } catch (error) {
        console.error('Error creating tag:', error);
        alert('Error creating tag. Please try again.');
      }
    } else {
      alert('Please enter a tag name and select at least one mixtape.');
    }
  };

  const toggleMixtapeSelection = (mixtape) => {
    setSelectedMixtapes(prev => 
      prev.some(m => m.id === mixtape.id)
        ? prev.filter(m => m.id !== mixtape.id)
        : [...prev, mixtape]
    );
  };

  const handleDragStart = (index) => {
    setDraggingTagIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
  };

  const handleDrop = (index) => {
    if (draggingTagIndex === null) return;

    const updatedTags = Array.from(tags);
    const [movedTag] = updatedTags.splice(draggingTagIndex, 1);
    updatedTags.splice(index, 0, movedTag);
    setTags(updatedTags);
    setDraggingTagIndex(null);

    // Update Firestore with new order
    const updates = updatedTags.map((item, idx) => {
      return updateDoc(doc(db, 'tags', item.id), {
        order: idx,
      });
    });

    Promise.all(updates)
      .then(() => console.log('Tags reordered successfully'))
      .catch(error => {
        console.error('Error updating tag order:', error);
        alert('Failed to update tag order. Please try again.');
        fetchTags(); // Revert to original order if update fails
      });
  };

  const handleDeleteTag = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteDoc(doc(db, 'tags', tagId));
        alert('Tag deleted successfully!');
        await fetchTags(); // Refresh the tags after deletion
      } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Error deleting tag. Please try again.');
      }
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Header />
      <div className="container min-h-screen mx-auto px-4 py-8 flex">
        <div className="w-[70%] pr-4">
          <h1 className="text-3xl font-bold mb-6">Mixtapes and Tags</h1>
          
          <form onSubmit={handleTagCreation} className="mb-8">
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              className="border p-2 mr-2"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
              Create Tag
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mixtapes.map((mixtape) => (
              <div 
                key={mixtape.id} 
                className={`border p-4 cursor-pointer ${
                  selectedMixtapes.some(m => m.id === mixtape.id) ? 'bg-blue-100' : ''
                }`}
                onClick={() => toggleMixtapeSelection(mixtape)}
              >
                <img src={mixtape.imageUrl} alt={mixtape.name} className="w-full h-40 object-cover mb-2" />
                <p className="font-semibold">{mixtape.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[30%] pl-4 border-l">
          <h2 className="text-2xl font-bold mb-4">Re-Order Tags - by Drag and Drop</h2>
          <ul className="space-y-2">
            {tags.map((tag, index) => (
              <li
                key={tag.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`p-2 bg-gray-100 rounded cursor-move ${draggingTagIndex === index ? 'bg-blue-200' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span>{tag.tagName}</span>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
