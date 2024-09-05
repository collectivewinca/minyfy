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
import { IoIosLink } from "react-icons/io";

const SocialShareButtons = ({ shareUrl, title }) => {
  const [copied, setCopied] = useState(false);

  const handleSmsShare = () => {
    window.open(`sms:?body=${encodeURIComponent(title + ': ' + shareUrl)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const emailBody = `
    Check out my Mixtape on Miny Vinyl
        
    You can listen directly from here: 
  `;

  return (
    <>
      <div className="w-full max-w-sm mt-4 mb-2">
        <div className="flex items-center">
          <span className="inline-flex items-center h-12 py-2.5 px-4 text-sm font-medium bg-lime-400 border border-lime-600 rounded-l-lg">
            <IoIosLink className="text-xl text-black"/>
          </span>
          <input
            id="share-url"
            type="text"
            className="w-full h-12 p-2.5 text-sm bg-black text-lime-400 font-jakarta border border-lime-600 "
            value={shareUrl}
            readOnly
          />
          <button
            onClick={handleCopyLink}
            className={`h-12 py-2.5 px-3 text-xl font-medium text-black bg-lime-400 rounded-r-lg hover:bg-lime-500 transition-colors ${
              copied ? 'bg-green-500' : ''
            }`}
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? (
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
              </svg>
            ) : (
              <FaCopy />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center mb-3">
        <FacebookShareButton url={shareUrl} quote={title}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <TwitterShareButton url={shareUrl} title={title}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <WhatsappShareButton url={shareUrl} title={title}>
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>

        <EmailShareButton url={shareUrl} subject={title} body={emailBody}>
          <EmailIcon size={32} round />
        </EmailShareButton>

        <button onClick={handleSmsShare} className="bg-green-500 p-2 rounded-full">
          <FaSms size={18} color="white" />
        </button>
      </div>
    </>
  );
};

export default SocialShareButtons;
