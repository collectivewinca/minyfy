import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  return (
    <header className="fixed top-[-30px] left-0 w-1/2 right-0 z-50 flex items-center justify-between py-1 px-1">
      <div className="flex gap-1 items-center">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Image src="/Logo.png" alt="Icon" width={140} height={100} />
        </div>
      </div>
    </header>
  );
};

export default Header;
