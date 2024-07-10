import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  return (
    <header className="fixed md:top-[-30px] top-[-10px] md:left-[-30px] w-2/3  left-[-10px] right-0 z-50 flex items-center justify-between py-2 px-4 sm:px-6 lg:px-8 z-10 ">
      <div className="flex items-center">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Image 
            src="/Logo.png" 
            alt="Icon" 
            width={140} 
            height={100} 
            className="w-20 sm:w-24 md:w-28 lg:w-32 "
          />
        </div>
      </div>
    </header>
  );
};

export default Header;