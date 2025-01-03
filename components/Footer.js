import React from 'react';
import { FaPhoneAlt}from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import Link from 'next/link';
import { FaRedditAlien } from "react-icons/fa";
import { FaLastfm } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black border-t border-gray-600">
      <div className="mx-auto w-full px-4 pb-4 font-jakarta">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <a href="" className="flex justify-center md:justify-start">
              <img src="/Minylogo.png" className="md:h-[18vh] h-[12vh] mt-2 me-3" alt="Miny Vinyl Logo" />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:pt-6 md:pr-5 text-center md:text-left">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">Integrations</h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4 flex items-center justify-center md:justify-start">
                  <FaLastfm className="mr-1 text-xl text-gray-400 " />
                  <Link href="/lastfm" className="hover:underline">Last.fm</Link>
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <FaRedditAlien className="mr-1 text-xl text-gray-400 " />
                  <Link href="/reddit" className="hover:underline">Reddit</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">Resources</h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="https://subwaymusician.xyz/" className="hover:underline">Subway Musician</a>
                </li>
                <li>
                  <a href="https://miny.minyvinyl.com" className="hover:underline">Rapid Connect</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">Follow us</h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="https://www.instagram.com/minyvinyl/" className="hover:underline">Instagram</a>
                </li>
                <li>
                  <a href="https://x.com/minyvinyl/" className="hover:underline">Twitter</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">Legal</h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:underline">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:underline">T&C</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <div className="flex flex-col items-center w-full sm:flex-row sm:justify-between">
          <span className="text-sm text-gray-400 text-center sm:text-left mb-4 sm:mb-0">
            © 2024 <a href="minyvinyl.com" className="hover:underline">Minyfy</a>. All Rights Reserved.
          </span>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="text-gray-400 flex items-center gap-2 text-sm hover:text-white">
              <FaPhoneAlt className='text-base' /> +1 (415) 936-7377
            </div>
            <div className="text-gray-400 flex items-center gap-2 text-sm hover:text-white">
              <MdEmail className='text-base' /> hello@minyvinyl.com
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
