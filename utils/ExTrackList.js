import React from 'react';
import { FaHeart, FaComment } from "react-icons/fa";
import { MdPoll, MdMic } from "react-icons/md";

const toSentenceCase = (str) => {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
};

const TrackList = ({ tracks, currentTrackIndex, handleTrackClick, comments }) => {
  const getCommentCounts = (trackName) => {
    const trackComments = comments.filter(comment => comment.trackRefer === trackName);
    const totalCount = trackComments.reduce((sum, comment) => {
        // Each comment counts, plus its replies
        return sum + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);

    const counts = {
      text: trackComments.reduce((sum, c) => sum + (c.commentType === 'text' ? 1 + c.replies.length : 0), 0),
      sticker: trackComments.reduce((sum, c) => sum + (c.commentType === 'sticker' ? 1 + c.replies.length : 0), 0),
      voice: trackComments.reduce((sum, c) => sum + (c.commentType === 'voice' ? 1 + c.replies.length : 0), 0),
      poll: trackComments.reduce((sum, c) => sum + (c.commentType === 'poll' ? 1 + c.replies.length : 0), 0),
    };

    return { totalCount, counts };
};


  const renderCommentIcons = (counts) => {
    const icons = [];
    if (counts.text > 0) icons.push({ icon: <FaComment className='text-[#f48531]' />, key: "comment" });
    if (counts.sticker > 0) icons.push({ icon: <FaHeart className='text-[#f48531]' />, key: "heart" });
    if (counts.voice > 0) icons.push({ icon: <MdMic className='text-[#f48531]' />, key: "mic" });
    if (counts.poll > 0) icons.push({ icon: <MdPoll className='text-[#f48531]' />, key: "poll" });
    return icons;
  };

  return (
    <div className="flex flex-col px-1 c1 items-end text-[2.1vw] md:text-[1vw] font-wittgenstein font-base text-neutral-300 tracking-wider">
      {tracks.map((track, index) => {
        const { totalCount, counts } = getCommentCounts(track.title);
        const icons = renderCommentIcons(counts);
        return (
          <div
            key={index}
            className={`relative cursor-pointer  flex justify-center text-[#f48531] items-center`}
            onClick={() => handleTrackClick(index)}
          >
            &#8203;
            {totalCount > 0 && (
              <span className="flex  items-center font-jakarta">
                {/* Adjusting totalCount size for different screens */}
                <div className=' font-jakarta  font-bold' style={{marginRight: "1px"}}>
                  {totalCount}
                </div>
                <div className=" relative h-5 flex items-center">
                  {icons.map(({ icon, key }, iconIndex) => (
                    <div 
                      key={key} 
                      className="absolute rounded-full p-[2px] md:p-1    bg-[#f48531] shadow-lg border border-black transition-transform hover:scale-110"
                      style={{
                        left: `${iconIndex * 9.5}px`,
                        zIndex: icons.length - iconIndex,
                        padding: "3px",
                      }}
                    >
                      {/* Adjusting icon size for small screens */}
                      {React.cloneElement(icon, { className: "w-1 h-1 sm:w-3 sm:h-3 text-black" })}
                    </div>
                  ))}
                </div>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TrackList;
