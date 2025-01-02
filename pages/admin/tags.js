import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Keep Firebase storage
import { storage } from '@/firebase/config'; // Keep Firebase storage
import { FaTrash } from 'react-icons/fa';
import Header from '@/components/Header';
import { supabase } from '@/supabase/config';
import { useRouter } from 'next/router';

export default function Tags() {
  const [mixtapes, setMixtapes] = useState([]);
  const [tagName, setTagName] = useState('');
  const [selectedMixtapes, setSelectedMixtapes] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagImage, setTagImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draggingTagIndex, setDraggingTagIndex] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        await Promise.all([fetchMixtapes(), fetchTags()]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, []);

  const fetchMixtapes = async () => {
    try {
      const { data: mixtapesData, error } = await supabase
        .from('mixtapes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150);

      if (error) throw error;
      setMixtapes(mixtapesData);
    } catch (error) {
      console.error('Error fetching mixtapes:', error);
      throw error;
    }
  };

  const fetchTags = async () => {
    try {
      const { data: tagsData, error } = await supabase
        .from('tags')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  };

  const handleImageUpload = async () => {
    if (!tagImage) return null;

    try {
      const fileName = `tag-${Date.now()}-${tagImage.name}`;
      const storageRef = ref(storage, `tag-images/${fileName}`);
      await uploadBytes(storageRef, tagImage);
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSaveTag = async () => {
    try {
      const tagImageUrl = await handleImageUpload();
      
      const tagData = {
        tag_name: tagName,
        tag_image_url: tagImageUrl,
        order_num: tags.length,
        selected_mixtapes: selectedMixtapes.map(mixtape => ({
          id: mixtape.id,
          name: mixtape.name,
          image_url: mixtape.image_url,
          background_image: mixtape.background_image,
          shortened_link: mixtape.shortened_link
        }))
      };

      const { error } = await supabase
        .from('tags')
        .insert([tagData]);

      if (error) throw error;

      alert('Tag saved successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Failed to save tag');
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error("Error deleting tag:", error);
      setError("Failed to delete tag. Please try again.");
    }
  };

  const handleDragStart = (index) => {
    setDraggingTagIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex) => {
    if (draggingTagIndex === null || draggingTagIndex === dropIndex) return;

    try {
      const newTags = [...tags];
      const [draggedTag] = newTags.splice(draggingTagIndex, 1);
      newTags.splice(dropIndex, 0, draggedTag);

      // Update order_num for all tags
      const updates = newTags.map((tag, index) => ({
        id: tag.id,
        order_num: index
      }));

      // Update all tags in a single transaction
      const { error } = await supabase
        .from('tags')
        .upsert(updates);

      if (error) throw error;

      setTags(newTags);
    } catch (error) {
      console.error("Error reordering tags:", error);
      setError("Failed to reorder tags. Please try again.");
    } finally {
      setDraggingTagIndex(null);
    }
  };

  const toggleMixtapeSelection = (mixtape) => {
    setSelectedMixtapes(prev => 
      prev.some(m => m.id === mixtape.id)
        ? prev.filter(m => m.id !== mixtape.id)
        : [...prev, mixtape]
    );
  };

  const handleTagCreation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleSaveTag();
      setTagName('');
      setTagImage(null);
      setSelectedMixtapes([]);
      await fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      setError('Failed to create tag. Please try again.');
    } finally {
      setLoading(false);
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

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTagImage(e.target.files[0])}
              className="border p-2 mr-2"
            />

            <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tag'}
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
                <img 
                  src={mixtape.image_url}
                  alt={mixtape.name} 
                  className="w-full h-48 mb-2" 
                />
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
                  <span>{tag.tag_name}</span>
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
