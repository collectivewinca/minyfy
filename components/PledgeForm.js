import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import { useRouter } from 'next/router';
import { FaArrowRightFromBracket } from "react-icons/fa6";

const MinyPledge = ({ formData, handleFormChange, handlePledgeSubmit, handleBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [signatureName, setSignatureName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  useEffect(() => {
    if (formData.category) {
      setSelectedCategory(formData.category);
    }
  }, [formData.category]);

  const categoryContent = {
    Fan: {
      pledges: [
        "Participate in exclusive Q&A sessions or virtual meet-and-greet events with my favorite artists hosted on the MINY platform.",
        "Support artist releases by purchasing and reviewing at least one exclusive track or album from an artist I follow on MINY.",
        "Build community by organizing or participating in a MINY fan group, either online or in-person, to discuss and promote my favorite music and experiences.",
        "Provide ongoing feedback through regular surveys and participate in beta testing for new features."
      ]
    },
    Artist: {
      pledges: [
        "Create and share exclusive content (e.g., behind-the-scenes footage, early access to new tracks) with fans on the MINY platform.",
        "Host regular interactive sessions (e.g., live performances, Q&A sessions) exclusively for MINY users.",
        "Collaborate with fans on creative projects (e.g., crowd-sourced remix, fan art contest) and showcase the results on MINY.",
        "Incorporate fan feedback into my creative process and share updates on how fan suggestions have influenced my work."
      ]
    },
    "Record Label": {
      pledges: [
        "Implement and support initiatives that facilitate direct interactions between artists and their fans (e.g., fan club memberships, exclusive events).",
        "Utilize MINY's data analytics to identify and engage with superfans, tailoring marketing and promotional efforts to foster stronger connections.",
        "Provide strategic feedback on the MINY platform and collaborate on pilot programs to test and refine new features aimed at enhancing direct fan engagement.",
        "Share insights and best practices with other labels and industry partners to collectively improve the ecosystem for direct artist-fan relationships."
      ]
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Valid 10-digit phone number is required";
    if (!formData.category) newErrors.category = "Category selection is required";
    if (!signatureName.trim()) newErrors.signatureName = "Please enter your name as signature";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handlePledgeSubmit({
        ...formData,
        category: selectedCategory,
        signed: !!signatureName.trim()
      });
    }
  };

  return (
    <div className="fixed font-jakarta flex-col inset-0 bg-white z-40 flex justify-center items-center overflow-y-auto">
      <header className="fixed md:top-[-30px] top-[-25px] md:left-[-30px] w-dull left-[-10px] right-0 z-50 flex items-center justify-between py-2 px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center">
          <div className="cursor-pointer" onClick={() => router.push('/')}>
            <img 
              src="/Logo.png" 
              alt="Icon" 
              className="w-20 sm:w-24 md:w-28 lg:w-32 "
            />
          </div>
        </div>
        <div onClick={handleBack} className='p-2 border-2 mb-4 border-black hover:bg-black rounded cursor-pointer hover:text-white'>
          <FaArrowRightFromBracket className='text-xl'/>
        </div>
      </header>
      <div className="layout-container flex h-full grow font-jakarta flex-col">
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] rounded-2xl flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://cdn.usegalileo.ai/stability/b3365501-2a6a-4937-9ac4-035bddaa9674.png")',
                  }}
                >
                  <div className="flex flex-col gap-2 text-left">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      The future of music starts with MINY
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      We're on a mission to make music more sustainable and accessible. We believe that everyone should have the opportunity to participate in the music revolution,
                      and that's why we're giving you the chance to secure a limited edition Alpha MINY
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              MINY Pledge Form
            </h2>
            <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Welcome to the MINY community! By joining our waitlist or pre-ordering a MINY, you're not just getting an innovative music experience—you're also committing to help us build a vibrant, engaged community.
              Please review and agree to the following pledges that align with our core principles of fostering strong, direct relationships between artists and fans.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-3 pt-1">
              <div>
                <label className="block text-sm font-medium text-[#111418]">Full Name:</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.userName}
                  onChange={handleFormChange}
                  className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" 
                />
                {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111418]">Email Address:</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111418]">Phone Number:</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" 
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">
                Select Your Category
              </h3>
              <div className="space-y-4">
                {Object.keys(categoryContent).map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={category}
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        handleFormChange(e);
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={category} className="text-sm font-medium text-[#111418]">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              
              {selectedCategory && (
                <div className="mt-4">
                  <p className="text-[#111418] text-base font-semibold leading-normal pb-3">
                    As a {selectedCategory.toLowerCase()}, I pledge to:
                  </p>
                  <ul className="space-y-2">
                    {categoryContent[selectedCategory].pledges.map((pledge, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-black mt-2 mr-2 flex-shrink-0"></span>
                        <span className="text-[#111418] text-base leading-normal">{pledge}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-col md:flex-row gap-2 ">
                    <div className='w-full'>
                      <label className="block text-sm font-medium text-[#111418]">Enter your Name for signature:</label>
                      <input 
                        type="text" 
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" 
                      />
                      {errors.signatureName && <p className="text-red-500 text-xs mt-1">{errors.signatureName}</p>}
                    </div>
                    <div className='w-full'>
                      <label className="block text-sm font-medium text-[#111418]">Date:</label>
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] pt-5">
                 Terms and Conditions
              </h3>
              <p className="text-[#111418] text-base font-normal leading-normal  ">
                By signing this pledge form, I agree to actively participate in the MINY community as outlined above. I understand that my participation helps to foster strong, direct relationships between artists and fans and contributes to the growth and development of the MINY platform.
              </p>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]  pt-5">
                Confirmation
              </h3>
              <p className="text-[#111418] text-base font-normal leading-normal pb-3 ">
                Upon submission, you will receive a confirmation email with further instructions on how to engage with the MINY platform and fulfill your pledge commitments.
              </p>
              <div className="flex justify-center mt-6">
                <button 
                  type="submit" 
                  className="flex shadow-custom hover:bg-blue-400 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0b6fda] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Submit Pledge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinyPledge;
