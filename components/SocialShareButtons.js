import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';

const SocialShareButtons = ({ imageUrl, title }) => {
  const shareUrl = `${imageUrl}`;

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
    </div>
  );
};

export default SocialShareButtons;