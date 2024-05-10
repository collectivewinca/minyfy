// Header.js

import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-8">
      <div className="flex gap-1 items-center">
        <div className="">
          <img src="/vinyl-record.png" alt="Icon" width={40} height={40} /> {/* Replace "vinyl-record.png" with your actual icon image */}
        </div>
        <div className="font-medium text-2xl">MINYFY</div>
      </div>
    </header>
  );
};

export default Header;
