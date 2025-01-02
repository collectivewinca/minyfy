import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { supabase } from '@/supabase/config';

const MixtapesCopy = () => {
  const [mixtapes, setMixtapes] = useState([]);
  const [selectedMixtapes, setSelectedMixtapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMixtapes = async () => {
    setLoading(true);
    try {
      const { data: newMixtapes, error } = await supabase
        .from('mixtapes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(mixtapes.length, mixtapes.length + 49);

      if (error) throw error;

      setMixtapes(prev => [...prev, ...newMixtapes]);
    } catch (error) {
      console.error("Error fetching mixtapes:", error);
    } finally {
      setLoading(false);
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
  const handleCopyToClipboard = () => {
    const selectedData = selectedMixtapes.map(({ name, image_url, shortened_link }) => ({
      name,
      image_url,
      shortened_link
    }));
    navigator.clipboard.writeText(JSON.stringify(selectedData, null, 2));
    alert('Data copied to clipboard!');
  };

  const handleDownloadCSV = () => {
    const selectedData = selectedMixtapes.map(({ name, image_url, shortened_link }) => ({
      name,
      image_url,
      shortened_link
    }));
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Image URL,Shortened Link\n" +
      selectedData.map(row => 
        `${row.name},${row.image_url},${row.shortened_link}`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mixtapes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            onClick={handleCopyToClipboard}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400"
            disabled={selectedMixtapes.length === 0}
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400"
            disabled={selectedMixtapes.length === 0}
          >
            Download CSV
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
                  src={mixtape.image_url || '/placeholder-image.jpg'}
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


