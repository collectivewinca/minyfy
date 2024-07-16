import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import { FaSms } from 'react-icons/fa';

const SocialShareButtons = ({ imageUrl, title }) => {
  const shareUrl = `${imageUrl}`;

  const handleSmsShare = () => {
    // This opens the default SMS app on mobile devices
    window.open(`sms:?body=${encodeURIComponent(title + ': ' + shareUrl)}`, '_blank');
  };

  const emailBody = `
    Check this out: Check out my collections on Miny Vinyl
    
    Image: https://minyfy.subwaymusician.xyz/gallery/miny2.jpg
    
    You can view the image directly here: https://minyfy.subwaymusician.xyz/gallery/miny2.jpg
  `;

  return (
    <div className='flex gap-3 items-center p-5'>
      <FacebookShareButton url={shareUrl} quote={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>

      <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <EmailShareButton 
        url={shareUrl} 
        subject={title} 
        body={emailBody}
        separator=" "
      >
        <EmailIcon size={32} round />
      </EmailShareButton>

      <button onClick={handleSmsShare} className="bg-green-500 p-2 rounded-full">
        <FaSms size={18} color="white" />
      </button>
    </div>
  );
};

export default SocialShareButtons;
