// Header.js

import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-8">
      <div className="flex gap-1 items-center">
        <div className="">
          <Image src="/vinyl-record.png" alt="Icon" width={40} height={40} /> 
        </div>
        <div className="font-medium text-2xl">MINYFY</div>
      </div>
    </header>
  );
};

export default Header;
