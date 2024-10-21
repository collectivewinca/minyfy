import React, { useState } from 'react';
import { PiMusicNoteFill } from "react-icons/pi";
import axios from 'axios';

const ImportRedditPlaylist = ({ onTracksChange }) => {
  const [redditUrl, setRedditUrl] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redditPosts, setRedditPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState('');
  const [postFetchLoading, setPostFetchLoading] = useState(false);
  const [postType, setPostType] = useState('hot'); // Default to 'hot'

  const handleRedditUrlChange = (event) => {
    setRedditUrl(event.target.value);
  };

  const cleanTrackName = (track) => {
    return track.replace(/^\d+[.)]?\s*/, '').trim();
  };

  const handleUrlImport = async () => {
    if (redditUrl.trim() === '') {
      setError('Please enter a Reddit post URL.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${redditUrl}.json`;
      const response = await axios.get(apiUrl);
      
      const postBody = response.data[0].data.children[0].data.selftext;
      const lines = postBody.split('\n').filter(line => line.trim());

      const validTracks = lines.map(line => cleanTrackName(line)).filter(line => line !== '');

      setAllTracks(validTracks);
      const initialSelectedTracks = validTracks.slice(0, 10);
      setSelectedTracks(initialSelectedTracks);
      onTracksChange(initialSelectedTracks);
      setError('');
    } catch (error) {
      console.error('Error importing from Reddit:', error);
      setError('Failed to import playlist. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrack = (track) => {
    if (selectedTracks.includes(track)) {
      const updatedTracks = selectedTracks.filter(t => t !== track);
      setSelectedTracks(updatedTracks);
      onTracksChange(updatedTracks);
    } else if (selectedTracks.length < 10) {
      const updatedTracks = [...selectedTracks, track];
      setSelectedTracks(updatedTracks);
      onTracksChange(updatedTracks);
    }
  };

  const fetchLastFmPosts = async () => {
    setPostFetchLoading(true);
    try {
      const response = await axios.get(`https://www.reddit.com/r/lastfm/${postType}.json`);
      const posts = response.data.data.children.map(post => ({
        title: post.data.title,
        url: post.data.url,
        selftext: post.data.selftext,
      }));
      setRedditPosts(posts);
      setError('');
    } catch (error) {
      console.error('Error fetching Last.fm posts:', error);
      setError('Failed to fetch posts from Last.fm subreddit.');
    } finally {
      setPostFetchLoading(false);
    }
  };

  const handlePostSelect = async (post) => {
    setSelectedPost(post.title);
    const lines = post.selftext.split('\n').filter(line => line.trim());
    const validTracks = lines.map(line => cleanTrackName(line)).filter(line => line !== '');

    setAllTracks(validTracks);
    const initialSelectedTracks = validTracks.slice(0, 10);
    setSelectedTracks(initialSelectedTracks);
    onTracksChange(initialSelectedTracks);
  };

  return (
    <div className="my-5 flex flex-col justify-start w-full">
      <h2 className="md:text-2xl text-base font-medium mb-4 font-jakarta">Import Reddit Playlist</h2>

      <div className="flex items-center mb-4">
        <input
          type="text"
          className="px-5 py-3 font-thin font-mono w-full bg-[#F4EFE6] md:text-lg text-sm text-neutral-500 rounded-l-xl"
          placeholder="Enter Reddit post URL..."
          value={redditUrl}
          onChange={handleRedditUrlChange}
        />
        <button
          className="bg-[#A18249] px-5 py-3 rounded-r-xl md:text-lg text-sm font-medium text-white hover:opacity-80"
          onClick={handleUrlImport}
          disabled={loading}
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
      
      <div className="flex mb-4">
        <select value={postType} onChange={(e) => setPostType(e.target.value)} className="mr-2 px-3 py-2 bg-[#F4EFE6] rounded">
          <option value="hot">Hot</option>
          <option value="new">Latest</option>
          <option value="top">Top</option>
          <option value="rising">Rising</option>
        </select>
        <button
          className="bg-[#A18249] px-5 py-3 rounded-md md:text-lg text-sm font-medium text-white hover:opacity-80"
          onClick={fetchLastFmPosts}
          disabled={postFetchLoading}
        >
          {postFetchLoading ? 'Fetching...' : 'Show Last.fm Subreddit'}
        </button>
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {redditPosts.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Select a Post</h2>
          <ul className="list-disc pl-5">
            {redditPosts.slice(0,15).map((post) => (
              <li key={post.url} className="cursor-pointer mb-2" onClick={() => handlePostSelect(post)}>
                {post.selftext}
              </li>
            ))}
          </ul>
        </div>
      )}

      {allTracks.length > 0 && (
        <div className="mt-5">
          <h2 className="md:text-xl text-base font-medium tracking-wider mb-4 font-jakarta">Playlist Tracks</h2>
          <p className="text-sm text-gray-700">Select up to 10 tracks. Currently selected: {selectedTracks.length}</p>
          <p className="mb-2 text-base font-medium text-gray-900">Click on the track to select or unselect</p>
          <ul className="md:pl-5 pl-2 list-disc text-lg uppercase">
            {allTracks.map((track) => (
              <li key={track} onClick={() => toggleTrack(track)} className="cursor-pointer flex md:gap-4 gap-2 mb-2 w-full items-center">
                <button
                  className={`p-2 rounded-md ${selectedTracks.includes(track) ? 'bg-[#A18249] text-white' : 'bg-[#F4EFE6] text-black'} font-extrabold`}
                >
                  <PiMusicNoteFill className='md:text-2xl text-lg' />
                </button>
                <div className='font-base font-jakarta md:text-xl text-sm'>{track}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportRedditPlaylist;
