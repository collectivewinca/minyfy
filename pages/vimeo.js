import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import Player from '@vimeo/player';

const Mixtape = () => {
  const router = useRouter();
  const { id } = router.query;
  const [mixtapeData, setMixtapeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [videoTitles, setVideoTitles] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    if (id) {
      const fetchMixtapeData = async () => {
        try {
          const docRef = doc(db, 'mixtapes', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setMixtapeData(data);
            console.log('Mixtape Data:', data);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching mixtape data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMixtapeData();
    }
  }, [id]);

  useEffect(() => {
    if (mixtapeData && playerContainerRef.current) {
      const currentVideo = mixtapeData.vimeo[currentVideoIndex];
      if (currentVideo && currentVideo.url) {
        playerRef.current = new Player(playerContainerRef.current, {
          url: currentVideo.url,
          width: 640,
          autoplay: true,
        });

        playerRef.current.on('ended', handleVideoEnded);
      }
    }
  }, [mixtapeData, currentVideoIndex]);

  const checkVideoProcessingStatus = async (videoId) => {
    try {
      const response = await axios.get(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN}`,
        },
      });

      const status = response.data.transcode.status;
      updateFirestoreVideoStatus(videoId, status === 'complete');
    } catch (error) {
      console.error('Error checking video status:', error);
    }
  };

  const updateFirestoreVideoStatus = async (videoId, isProcessed) => {
    try {
      const docRef = doc(db, 'mixtapes', id);
      await setDoc(docRef, {
        vimeo: mixtapeData.vimeo.map(video => 
          video.id === videoId ? { ...video, processed: isProcessed } : video
        ),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating Firestore video status:', error);
    }
  };

  const refreshProcessingStatuses = () => {
    mixtapeData.vimeo.forEach(video => {
      checkVideoProcessingStatus(video.id);
    });
  };

  const handleVideoEnded = () => {
    if (currentVideoIndex < mixtapeData.vimeo.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
  };

  const handleFileChange = (e) => {
    const selectedVideos = Array.from(e.target.files);
    setVideos(selectedVideos);
    setVideoTitles(selectedVideos.map((file) => file.name));
  };

  const uploadVideos = async () => {
    setUploading(true);
    const videoDetails = [];

    try {
      for (const video of videos) {
        const uploadResult = await uploadVideoToVimeo(video);
        if (uploadResult) {
          videoDetails.push({
            id: uploadResult.videoId,
            title: video.name,
            url: uploadResult.url,
            processed: false,
          });
          checkVideoProcessingStatus(uploadResult.videoId);
        }
      }

      await saveVideoDetailsToFirestore(videoDetails);
    } catch (error) {
      console.error('Error uploading videos:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadVideoToVimeo = async (file) => {
    try {
      const response = await axios.post(
        'https://api.vimeo.com/me/videos',
        {
          name: file.name,
          upload: {
            approach: 'tus',
            size: file.size,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const uploadLink = response.data.upload.upload_link;
      const videoId = response.data.uri.split('/').pop();

      await axios({
        method: 'PATCH',
        url: uploadLink,
        data: file,
        headers: {
          'Content-Type': 'application/offset+octet-stream',
          'Tus-Resumable': '1.0.0',
          'Upload-Offset': 0,
        },
      });

      return {
        url: response.data.link,
        videoId: videoId,
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      return null;
    }
  };

  const saveVideoDetailsToFirestore = async (videoDetails) => {
    try {
      const docRef = doc(db, 'mixtapes', id);
      await setDoc(docRef, {
        vimeo: videoDetails,
      }, { merge: true });
    } catch (error) {
      console.error('Error saving video details to Firestore:', error);
    }
  };

  useEffect(() => {
    // Play the first video if it is processed after the component mounts
    if (mixtapeData && mixtapeData.vimeo.length > 0) {
      const firstVideo = mixtapeData.vimeo[0];
      if (firstVideo.processed) {
        setCurrentVideoIndex(0); // Set to play the first video
      }
    }
  }, [mixtapeData]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mixtape Data</h1>
      {mixtapeData ? (
        <div>
          <p><strong>Title:</strong> {mixtapeData.name}</p>
          {mixtapeData.vimeo && mixtapeData.vimeo.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Vimeo Videos</h2>
              <div className="space-y-4">
                {mixtapeData.vimeo.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{video.title}</span>
                    <span className="text-sm">
                      {video.processed ? (
                        <span className="text-green-600">Processed</span>
                      ) : (
                        <span className="text-yellow-600">Processing...</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={refreshProcessingStatuses}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Refresh Processing Status
              </button>

              <h2 className="text-xl font-semibold mt-6">Video Player</h2>
              <div
                ref={playerContainerRef}
                className="w-full bg-black rounded-md overflow-hidden mt-4"
              ></div>
              {mixtapeData.vimeo[currentVideoIndex] && (
                <h3 className="text-lg font-medium mt-3">
                  {mixtapeData.vimeo[currentVideoIndex].title}
                </h3>
              )}
            </div>
          ) : (
            <p>No Vimeo videos found.</p>
          )}
        </div>
      ) : (
        <p>No data found for this mixtape.</p>
      )}

      {/* File input for uploading videos */}
      <input
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
        className="p-2 border rounded-md"
      />
      <button
        onClick={uploadVideos}
        disabled={uploading || videos.length === 0}
        className={`px-4 py-2 mt-4 text-white rounded-md ${uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {uploading ? 'Uploading...' : 'Upload Videos'}
      </button>
    </div>
  );
};

export default Mixtape;
