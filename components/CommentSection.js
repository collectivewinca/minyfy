import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { TfiCommentAlt } from 'react-icons/tfi';
import {
  MdPoll,
  MdMic,
  MdStop,
  MdTextFields,
  MdPlayArrow,
  MdPause,
} from 'react-icons/md';
import { IoMusicalNotesSharp } from 'react-icons/io5';
import WaveSurfer from 'wavesurfer.js';
import { db, storage } from '@/firebase/config';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Example stickers data
const stickers = [
  '/stickers/music1.png',
  '/stickers/music2.png',
  '/stickers/music3.png',
  '/stickers/music4.png',
  '/stickers/music5.png',
  '/stickers/music6.png',
  '/stickers/music7.png',
  '/stickers/music8.png',
  '/stickers/music9.png',
  '/stickers/music10.png',
];

const formatDate = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hrs ago`;
  if (days <= 3) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AudioPlayer = ({ audioUrl }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurferReady, setWavesurferReady] = useState(false);

  useEffect(() => {
    const cleanupWavesurfer = () => {
      if (wavesurfer.current && wavesurferReady) {
        try {
          wavesurfer.current.unAll();
          wavesurfer.current.destroy();
          wavesurfer.current = null;
        } catch (error) {
          console.error('Error destroying wavesurfer instance:', error);
        }
      }
    };

    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#919190',
        progressColor: '#77c043',
        cursorColor: '#77c043',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        backend: 'WebAudio', 
        height: 60,
        normalize: true,
        partialRender: true,
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('finish', () => setIsPlaying(false));

      wavesurfer.current.on('ready', () => setWavesurferReady(true));
    }

    return cleanupWavesurfer;
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      setIsPlaying((prevState) => !prevState);
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className="flex gap-2 items-start w-full">
      <button
        onClick={handlePlayPause}
        className="mt-2 p-2 bg-lime-950 text-2xl text-lime-400 rounded-full hover:bg-lime-900"
      >
        {isPlaying ? <MdPause /> : <MdPlayArrow />}
      </button>
      <div ref={waveformRef} className="w-full px-3" />
    </div>
  );
};

const CommentSection = ({
  comments,
  setComments,
  docId,
  displayName,
  avatarUrl,
  handleLogin,
  currentTrackName,
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const timerRef = useRef(null);

  // Voice recording setup
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const updateFirestore = async (newComments) => {
    try {
      const docRef = doc(db, 'mixtapes', docId);
      
      // Calculate the length of the comments array
      const commentCount = newComments.length;
  
      // Update both the comments array and the commentCount field
      await updateDoc(docRef, {
        comments: newComments,
        commentCount: commentCount, // Add commentCount field
      });
      
    } catch (error) {
      console.error('Error updating Firestore: ', error);
    }
  };
    

  const handleRemoveComment = async (commentId) => {
    if (!displayName) {
      handleLogin();
      return;
    }

    const commentToRemove = comments.find(comment => comment.id === commentId);
    if (!commentToRemove || commentToRemove.author !== displayName) {
      alert("You can only remove your own comments.");
      return;
    }

    const updatedComments = comments.filter(comment => comment.id !== commentId);
    setComments(updatedComments);

    try {
      const docRef = doc(db, 'mixtapes', docId);
      await updateDoc(docRef, {
        comments: updatedComments,
      });
    } catch (error) {
      console.error('Error removing comment from Firestore: ', error);
      alert('Failed to remove comment. Please try again.');
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo((prevReplyingTo) =>
      prevReplyingTo === commentId ? null : commentId
    );
  };

  const handleCommentSubmit = async (e, parentId = null) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!displayName) {
      handleLogin();
      return;
    }

    const newCommentObj = {
      id: Date.now(),
      author: displayName,
      avatar: avatarUrl,
      date: Date.now(),
      content: newComment,
      replies: [],
      trackRefer: currentTrackName,
      commentType: 'text',
    };

    let updatedComments;
    if (parentId) {
      updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, newCommentObj],
          };
        }
        return comment;
      });
    } else {
      updatedComments = [...comments, newCommentObj];
    }

    setComments(updatedComments);
    await updateFirestore(updatedComments);

    setNewComment('');
    setReplyingTo(null);
  };

  const handleStickerClick = async (stickerUrl, parentId = null) => {
    if (!displayName) {
      handleLogin();
      return;
    }

    const newStickerComment = {
      id: Date.now(),
      author: displayName,
      avatar: avatarUrl,
      trackRefer: currentTrackName,
      date: Date.now(),
      content: stickerUrl,
      replies: [],
      commentType: 'sticker',
    };

    let updatedComments;
    if (parentId) {
      updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, newStickerComment],
          };
        }
        return comment;
      });
    } else {
      updatedComments = [...comments, newStickerComment];
    }

    setComments(updatedComments);
    await updateFirestore(updatedComments);
  };

  const toggleDropdown = (id) => {
    setDropdownOpen((prevDropdownOpen) =>
      prevDropdownOpen === id ? null : id
    );
  };

  const handleStartPoll = () => {
    setShowPollCreator((prevShowPollCreator) => !prevShowPollCreator);
    if (showVoiceRecorder) setShowVoiceRecorder(false);
  };

  const handleVoiceRecorder = () => {
    setShowVoiceRecorder((prevShowVoiceRecorder) => !prevShowVoiceRecorder);
    if (showPollCreator) setShowPollCreator(false);
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmitPoll = async () => {
    if (!displayName) {
      handleLogin();
      return;
    }

    const filledOptions = pollOptions.filter((option) => option.trim());

    if (!pollQuestion.trim() || filledOptions.length < 2) {
      alert('Please enter a poll question and at least two options.');
      return;
    }

    const newPoll = {
      id: Date.now(),
      author: displayName,
      avatar: avatarUrl,
      date: Date.now(),
      question: pollQuestion,
      trackRefer: currentTrackName,
      options: filledOptions.map((option) => ({
        text: option,
        votes: 0,
        votedBy: [], // Add votedBy array to track who voted
      })),
      totalVotes: 0,
      commentType: 'poll',
      replies: [],
    };

    const updatedComments = [...comments, newPoll];
    setComments(updatedComments);
    await updateFirestore(updatedComments);

    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleVote = async (pollId, optionIndex) => {
    if (!displayName) {
      handleLogin();
      return;
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id === pollId && comment.commentType === 'poll') {
        // Check if the user already voted
        if (
          comment.options[optionIndex].votedBy?.includes(displayName)
        ) {
          return comment; // User already voted, do nothing
        }

        const updatedOptions = comment.options.map((option, index) => {
          if (index === optionIndex) {
            return {
              ...option,
              votes: option.votes + 1,
              votedBy: [...option.votedBy, displayName], // Add user to votedBy
            };
          }
          return option;
        });
        return {
          ...comment,
          options: updatedOptions,
          totalVotes: comment.totalVotes + 1,
        };
      }
      return comment;
    });

    setComments(updatedComments);
    await updateFirestore(updatedComments);
  };

  const PollDisplay = ({ poll, onVote }) => {
    if (!poll) return null;

    return (
      <div className="poll-container">
        <h3 className="font-bold text-white mb-2">{poll.question}</h3>
        <ul className="space-y-2">
          {poll.options.map((option, index) => {
            const percentage =
              poll.totalVotes > 0
                ? (option.votes / poll.totalVotes) * 100
                : 0;
            return (
              <li key={index} className="relative">
                <button
                  onClick={() => handleVote(poll.id, index)}
                  className="w-full text-left bg-neutral-700 text-white px-3 py-2 rounded-full hover:bg-neutral-600 transition-colors duration-200"
                  disabled={poll.options[index].votedBy?.includes(
                    displayName
                  )} // Disable button if user already voted
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#77c043] opacity-80 rounded-full "
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="relative z-10 flex justify-between">
                    <span>{option.text}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 text-sm text-gray-400">
          Total votes: {poll.totalVotes}
        </div>
      </div>
    );
  };

  
  const handleStartRecording = async () => {
    if (!displayName) {
      handleLogin();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      };

      mediaRecorderRef.current.onstop = async () => {
        clearInterval(timerRef.current);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });

        if (audioBlob.size > 0) {
          await handleUploadAudio(audioBlob);
        } else {
          console.error('No audio data recorded');
          alert('No audio was recorded. Please try again.');
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check your permissions and try again.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUploadAudio = async (audioBlob) => {
    setIsUploading(true);
    try {
      const audioFile = new File([audioBlob], `voice_comment_${Date.now()}.webm`, { type: 'audio/webm' });

      const storageRef = ref(storage, `voice_comments/${audioFile.name}`);
      await uploadBytes(storageRef, audioFile);
      const audioDownloadUrl = await getDownloadURL(storageRef);

      const newVoiceComment = {
        id: Date.now(),
        author: displayName,
        avatar: avatarUrl,
        trackRefer: currentTrackName,
        date: Date.now(),
        content: audioDownloadUrl,
        replies: [],
        commentType: 'voice',
        duration: recordingTime,
      };

      const updatedComments = [...comments, newVoiceComment];
      setComments(updatedComments);
      await updateFirestore(updatedComments);

      setShowVoiceRecorder(false);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Error uploading audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="bg-black max-w-2xl py-8 lg:py-16 font-jakarta antialiased">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-2xl font-bold text-white">
            Fans Discussion ({comments.length})
          </h2>
        </div>
        <form
          className="mb-6"
          onSubmit={(e) => handleCommentSubmit(e, replyingTo)}
        >
          <div className="py-2 px-4 mb-4 rounded-lg rounded-t-lg backdrop-filter backdrop-blur-md shadow-2xl border border-neutral-700 bg-white bg-opacity-10">
            <label htmlFor="comment" className="sr-only">
              Your comment
            </label>
            <input
              id="comment"
              rows="6"
              className="px-0 w-full text-sm text-gray-300 bg-transparent border-0 focus:ring-0 focus:outline-none"
              placeholder="Write a comment..."
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>

          <div className="flex md:flex-row flex-col gap-2  md:justify-between">
            <button
              type="submit"
              className="bg-lime-950 text-lime-400 border-[1.4px] border-lime-400 border-b-4 font-medium md:text-base text-sm md:px43 px-4 md:py-2 py-2 justify-center rounded-full hover:brightness-150 duration-300 flex gap-1 items-center cursor-pointer"
            >
              <MdTextFields className="md:text-xl text-lg" /> Post
              Comment
            </button>
            <button
              type="button"
              onClick={handleStartPoll}
              className="bg-lime-950 text-lime-400 border-[1.4px] border-lime-400 border-b-4 font-medium md:text-base text-sm md:px43 px-4 md:py-2 justify-center  py-2 rounded-full hover:brightness-150 duration-300 flex gap-1 items-center cursor-pointer"
            >
              <MdPoll className="md:text-xl text-lg" /> Start Poll
            </button>
            <button
              type="button"
              onClick={handleVoiceRecorder}
              className="bg-lime-950 text-lime-400 border-[1.4px] border-lime-400 border-b-4 font-medium md:text-base text-sm md:px43 px-4 md:py-2 justify-center  py-2 rounded-full hover:brightness-150 duration-300 flex gap-0 items-center cursor-pointer"
            >
              <MdMic className="md:text-xl text-lg" /> Record Voice
            </button>
          </div>
        </form>

        {showPollCreator && (
          <div className="mb-6 p-4 rounded-lg backdrop-filter backdrop-blur-md shadow-2xl border border-neutral-700 bg-white bg-opacity-10">
            <input
              type="text"
              placeholder="Enter your poll question"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full mb-4 p-2 bg-neutral-800 text-white rounded"
            />
            {pollOptions.map((option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) =>
                  handlePollOptionChange(index, e.target.value)
                }
                className="w-full mb-2 p-2 bg-neutral-800 text-white rounded"
              />
            ))}
            <button
              onClick={handleSubmitPoll}
              className="mt-2  px-4 py-2 bg-lime-950 text-lime-400 rounded hover:bg-lime-900"
            >
              Create Poll
            </button>
            <button
              onClick={handleAddPollOption}
              className="mt-2 ml-2 px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600"
            >
              Add Option
            </button>
          </div>
        )}

{showVoiceRecorder && (
      <div className="mb-6 p-4 rounded-lg backdrop-filter backdrop-blur-md shadow-2xl border border-neutral-700 bg-white bg-opacity-10">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isUploading}
          className={`px-4 w-full text-lg flex flex-col justify-center items-center py-4 rounded ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : isUploading
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-lime-950 text-lime-400 hover:bg-lime-900'
          }`}
        >
          {isRecording ? (
            <>
              <MdStop className="text-3xl" />
              <span className="blink">Stop Recording ({recordingTime}s)</span>
            </>
          ) : isUploading ? (
            <>
              <span className="animate-spin mr-2">&#9696;</span>
              Uploading...
            </>
          ) : (
            <>
              <MdMic className="text-3xl" /> Start Recording
            </>
          )}
        </button>
      </div>
    )}

        <div className="grid grid-cols-5 gap-2 mt-2 mb-8">
          {stickers.map((sticker, index) => (
            <img
              key={index}
              src={sticker}
              alt={`sticker-${index}`}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleStickerClick(sticker)}
            />
          ))}
        </div>

        {comments.slice().reverse().map((comment) => (
          <div key={comment.id} className="mb-5 flex flex-col items-end">
            <article className=" text-base backdrop-filter backdrop-blur-md shadow-2xl border border-neutral-700 px-5 pb-8 rounded-lg bg-white bg-opacity-10 w-full">
              <div className="px-2 pr-3 text-sm items-center my-2 inline-flex gap-1 py-1 rounded-full text-black bg-[#77c043] w-auto">
                <IoMusicalNotesSharp className="text-lg" />
                <span>{comment.trackRefer}</span>
              </div>

              <div className=" flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="inline-flex items-center mr-3 text-sm text-white font-semibold">
                    <img
                      className="mr-2 w-6 h-6 rounded-full"
                      src={comment.avatar}
                      alt={comment.author}
                    />
                    {comment.author}
                  </div>
                  <div className="text-sm text-gray-400">
                    <time
                      pubdate
                      dateTime={comment.date}
                      title={comment.date}
                    >
                      {formatDate(comment.date)}
                    </time>
                  </div>
                </div>
                <div className="relative">
                  <button
                    className="inline-flex items-center p-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-neutral-700"
                    onClick={() => toggleDropdown(comment.id)}
                  >
                    <FiMoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">Comment settings</span>
                  </button>
                  {dropdownOpen === comment.id && (
                    <div className="absolute right-0 mt-1 rounded bg-neutral-700 divide-neutral-600 z-10">
                      <ul className="py-1 text-sm text-neutral-200">
                        <li>
                          <div
                            onClick={() => handleRemoveComment(comment.id)}
                            className="block py-2 px-4 hover:bg-neutral-600 cursor-pointer hover:text-red-400"
                          >
                            Remove
                          </div>
                        </li>
                        <li>
                          <div
                            onClick={() =>{alert('Reported Successfully!')}}
                            className="block py-2 px-4 hover:bg-neutral-600 cursor-pointer hover:text-yellow-400"
                          >
                            Report
                          </div>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-300">
                {comment.commentType === 'text' && comment.content}
                {comment.commentType === 'sticker' && (
                  <img
                    src={comment.content}
                    alt="sticker"
                    className="w-32 h-32"
                  />
                )}
                {comment.commentType === 'poll' && (
                  <PollDisplay
                    poll={comment}
                    onVote={handleVote}
                  />
                )}
                {comment.commentType === 'voice' && (
                  <AudioPlayer audioUrl={comment.content} />
                )}
              </div>
              <div className="flex items-center mt-4 space-x-4">
                <button
                  type="button"
                  className="flex items-center text-sm text-gray-400 hover:underline font-medium"
                  onClick={() => handleReplyClick(comment.id)}
                >
                  <TfiCommentAlt className="mr-1.5 w-3.5 h-3.5" />
                  Reply
                </button>
              </div>
              {replyingTo === comment.id && (
                <form
                  className="mt-4"
                  onSubmit={(e) =>
                    handleCommentSubmit(e, comment.id)
                  }
                >
                  <div className="py-2 px-4 mb-4 rounded-lg backdrop-filter backdrop-blur-md shadow-2xl border border-neutral-700 bg-white bg-opacity-10">
                    <label
                      htmlFor={`reply-${comment.id}`}
                      className="sr-only"
                    >
                      Your reply
                    </label>
                    <textarea
                      id={`reply-${comment.id}`}
                      rows="4"
                      className="px-0 w-full text-sm text-gray-300 bg-transparent border-0 focus:ring-0 focus:outline-none"
                      placeholder="Write a reply..."
                      required
                      value={newComment}
                      onChange={(e) =>
                        setNewComment(e.target.value)
                      }
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-lime-950 text-lime-400 border border-lime-400 border-b-4 font-medium md:text-lg text-sm md:px-3 px-4 md:py-1 py-2 rounded-md hover:brightness-150 duration-300 flex gap-3 items-center cursor-pointer"
                  >
                    Post Reply
                  </button>
                </form>
              )}
            </article>
            {comment.replies &&
              Array.isArray(comment.replies) &&
              comment.replies.map((reply) => (
                <article
                  key={reply.id}
                  className="p-6 w-[90%] mt-2 text-base rounded-lg backdrop-filter backdrop-blur-md shadow-2xl border border-neutral-700 px-5 py-8 bg-white bg-opacity-10"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="inline-flex items-center mr-3 text-sm text-white font-semibold">
                        <img
                          className="mr-2 w-6 h-6 rounded-full"
                          src={reply.avatar}
                          alt={reply.author}
                        />
                        {reply.author}
                      </div>
                      <div className="text-sm text-gray-400">
                        <time
                          pubdate
                          dateTime={reply.date}
                          title={reply.date}
                        >
                          {formatDate(reply.date)}
                        </time>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-300">
                    {reply.content}
                  </div>
                </article>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;