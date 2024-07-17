import React, { useState } from 'react';
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
import { FaSms, FaCopy } from 'react-icons/fa';

const SocialShareButtons = ({ shareUrl, title }) => {
  const [copied, setCopied] = useState(false);

  const handleSmsShare = () => {
    window.open(`sms:?body=${encodeURIComponent(title + ': ' + shareUrl)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    });
  };

  const emailBody = `
    Check out my Mixtape on Miny Vinyl
        
    You can listen directly from here: ${shareUrl}
  `;

  return (
    <div className='flex gap-3 items-center p-5'>
      <button 
        onClick={handleCopyLink} 
        className={`bg-gray-500 p-2 rounded-full transition-colors duration-200 ${copied ? 'bg-green-500' : ''}`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        <FaCopy size={18} color={copied ? 'white' : 'black'} />
      </button>

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