import React, { useState } from 'react';

export default function SimplifiedTags() {
  const [tags, setTags] = useState([
    { id: '1', tagName: 'Rock' },
    { id: '2', tagName: 'Pop' },
    { id: '3', tagName: 'Jazz' },
    { id: '4', tagName: 'Classical' },
    { id: '5', tagName: 'Electronic' },
  ]);

  const [draggingTag, setDraggingTag] = useState(null);

  const handleDragStart = (index) => {
    setDraggingTag(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
  };

  const handleDrop = (index) => {
    const updatedTags = [...tags];
    const [removed] = updatedTags.splice(draggingTag, 1);
    updatedTags.splice(index, 0, removed);
    setTags(updatedTags);
    setDraggingTag(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Simplified Tags</h1>
      <ul className="space-y-2">
        {tags.map((tag, index) => (
          <li
            key={tag.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className={`p-4 bg-gray-100 rounded cursor-move 
              ${draggingTag === index ? 'bg-blue-200' : 'hover:bg-gray-200'} 
              transition-colors duration-200 flex items-center`}
          >
            <span className="mr-2">☰</span>
            {tag.tagName}
          </li>
        ))}
      </ul>
    </div>
  );
}
