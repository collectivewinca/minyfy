import React, { useState, useEffect } from 'react';
import { MdClose } from "react-icons/md";
import { FaArrowLeft,FaShoppingCart } from "react-icons/fa";

function BuyNow({ handleClose, formData, handleFormChange, isPledgeTaken, isProcessing, handlePledgeFormClick, backgroundImage, shortenedLink }) {
      const [errors, setErrors] = useState({});
      const validateForm = () => {
        let newErrors = {};
        if (!formData.userName.trim()) newErrors.userName = "Name is required";
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Valid 10-digit phone number is required";
        if (!formData.street.trim()) newErrors.street = "Street address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State/Province is required";
        if (!formData.postalCode.trim()) newErrors.postalCode = "Postal/Zip code is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
          handlePledgeFormClick();
          console.log("Form submitted:", formData);
        }
      };

      const useLoadingDots = () => {
        const [dots, setDots] = useState('');
        useEffect(() => {
          const timer = setInterval(() => {
            setDots(d => d.length < 4 ? d + '.' : '');
          }, 500);
          return () => clearInterval(timer);
        }, []);
        return dots;
      };
      const dots = useLoadingDots();

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          .close-button:hover {
            background-color: rgba(255, 0, 0, 0.5);
          }
        `}
      </style>

      <div className="fixed font-jakarta inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center py-10 ">
        <div className="relative my-3 md:w-2/3 rounded-lg backdrop-filter backdrop-blur-xl bg-neutral-200 bg-opacity-10 border border-white border-opacity-20 text-white max-h-[calc(100vh-3rem)] overflow-y-auto p-4 custom-scrollbar">
          
          <button
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-red-500 transition"
            onClick={handleClose}
          >
            <MdClose className="text-2xl text-white" />
          </button>

          <div className="text-center font-bold tracking-wide text-2xl mb-4">MINY Pre-Order Form</div>
          <div className="flex flex-col items-center md:justify-between w-full md:flex-row gap-3 pb-3">
            <div className="flex items-center gap-2">
              <div>
                <img src={backgroundImage} alt="Artwork" className="w-14 rounded-full md:w-[4rem]" />
              </div>
              <div className="flex flex-col">
                <div className="text-lg">{formData.title}'s Mixtape</div>
                <div className="text-base font-base cursor-pointer underline text-[#00dc04]">{shortenedLink.replace(/^https?:\/\//, '')}</div>
              </div>
            </div>
            <div className="text-5xl font-semibold" onClick={handleSubmit}>
            <div className="price-container">
          <div className="rotating-border"></div>
          <div className="discount">
          <div className=" flex items-center justify-center space-x-2 " >
                <span className=" text-[#00dc04] font-bold text-2xl pulse-gradient">$4.99</span>
                <FaArrowLeft className="text-white text-base" />
                <span className="text-2xl text-gray-300">$49.99 </span>
            </div>
            <div className="cta text-base text-center font-medium ">
              {!isPledgeTaken ? (
                  <button >
                      Take a Pledge now for instant savings!
                  </button>
              ) : (
                  <span >Offer Claimed</span>
              )}
          </div>
          </div>
        </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

             {!isProcessing && (
              <>
                <div className="md:flex md:space-x-4">
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">Name:</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.userName}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2  rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="name"
                    placeholder="recipient name"
                  />
                  {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                </div>
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">Email Address:</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="email"
                    placeholder="e.g. buy@minyvinyl.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
              <div className="md:flex md:space-x-4">
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">Phone Number:</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="tel"
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">Street Address:</label>
                  <input 
                    type="text" 
                    name="street"
                    value={formData.street}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="address-level1"
                    placeholder="e.g. 34 Elm Street"
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                </div>
              </div>
              <div className="md:flex md:space-x-4">
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">City:</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="address-level2"
                    placeholder="e.g. New York"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">State/Province:</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="address-level1"
                    placeholder="e.g. NY"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
              <div className="md:flex md:space-x-4">
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">Postal/Zip Code:</label>
                  <input 
                    type="text" 
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="postal-code"
                    placeholder="e.g. 62704"
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium">Country:</label>
                  <input 
                    type="text" 
                    name="country"
                    value={formData.country}
                    onChange={handleFormChange}
                    className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-white border-opacity-20 bg-opacity-80 text-neutral-300" 
                    autoComplete="country"
                    placeholder="e.g. United States"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="block text-sm font-medium">I understand that this is a limited edition drop, and there are no refunds or replacements. </label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}

              
              </>
             )} 

            <div className="w-full flex justify-center">
              <button className="bg-lime-950  relative z-20 text-lime-400 border border-lime-400 border-b-4 font-medium overflow-hidden md:text-2xl text-lg md:px-6 px-4 md:py-3 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group flex gap-3 items-center cursor-pointer" disabled={isProcessing}>
                <span className="bg-lime-400 shadow-lime-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)] cursor-pointer"></span>
                {isProcessing ? (<div>Processing{dots}</div>) : (
                  <>
                  {isPledgeTaken ? (<div>Pay $4.99</div>) : (<div>Pay $49.99</div>)}
                  </>
                )}
                              
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default BuyNow;
