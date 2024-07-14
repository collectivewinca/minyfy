import React, { useState, useEffect } from 'react';
import { TbLogin2 } from "react-icons/tb";
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { TbLogin } from "react-icons/tb";
import { auth } from '@/firebase/config';  // Adjust the path based on your project structure

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <header>
      <nav className="bg-white border-b rounded-xl border-gray-200 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
            <img src="/log.jpg" alt="Flowbite Logo" className="mr-3 h-12" />
          </div>
          <div className="flex items-center lg:order-2">
            {user ? (
              <button 
                onClick={handleLogout} 
                className="text-black border-r-[4px] border-b-[4px] border-black bg-[#73c33e] hover:opacity-80 focus:ring-4 flex gap-1 items-center focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2"
              >
                <TbLogin className='text-xl'/> Log out
              </button>
            ) : (
              <button 
                onClick={handleLogin} 
                className="text-black border-r-[4px] border-b-[4px] border-black bg-[#73c33e] hover:opacity-80 focus:ring-4 flex gap-1 items-center focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2"
              >
                <TbLogin2 className='text-xl'/> Log in
              </button>
            )}
            <button 
              data-collapse-toggle="mobile-menu-2" 
              type="button" 
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" 
              aria-controls="mobile-menu-2" 
              aria-expanded={menuOpen ? 'true' : 'false'}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`w-6 h-6 ${menuOpen ? 'hidden' : 'block'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
              </svg>
              <svg className={`w-6 h-6 ${menuOpen ? 'block' : 'hidden'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          <div className={`justify-between items-center w-full lg:flex lg:w-auto lg:order-1 ${menuOpen ? 'block' : 'hidden'}`} id="mobile-menu-2">
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <li>
                <div 
                  className="block py-2 pr-4 pl-3 text-neutral-800 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-[#73c33e] lg:p-0 cursor-pointer"
                  onClick={() => router.push('/makeaminy')}
                >
                  Customize Miny
                </div>
              </li>
              <li>
                <div 
                  className="block py-2 pr-4 pl-3 text-neutral-800 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-[#73c33e] lg:p-0 cursor-pointer"
                  onClick={() => router.push('/lastfm')}
                >
                  Last.fm
                </div>
              </li>
              <li>
                <div 
                  className="block py-2 pr-4 pl-3 text-neutral-800 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-[#73c33e] lg:p-0 cursor-pointer"
                  onClick={() => router.push('/collections')}
                >
                  Your Collections
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
