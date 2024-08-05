import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';

const MinyPledge = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

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

  return (
    <>
      <Head>
        <title>Pledge Form</title>
        
      </Head>
      <Header />
      <div
        className="relative flex size-full min-h-screen font-jakarta flex-col bg-white group/design-root overflow-x-hidden"
        style={{
          '--select-button-svg': 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(96,117,138)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e")',
          fontFamily: '"Be Vietnam Pro", "Noto Sans", sans-serif',
        }}
      >
        <div className="layout-container flex h-full grow font-jakarta flex-col">
          <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="@container">
                <div className="@[480px]:p-4">
                  <div
                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10"
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
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Contact Information
              </h3>
              <form className="space-y-4 px-4 pb-3 pt-1">
                <div>
                  <label className="block text-sm font-medium text-[#111418]">Full Name:</label>
                  <input type="text" className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111418]">Email Address:</label>
                  <input type="email" className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111418]">Phone Number:</label>
                  <input type="tel" className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111418]">Preferred Username (for MINY Platform):</label>
                  <input type="text" className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" />
                </div>
              </form>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Select Your Category
              </h3>
              <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">
                Please choose your category and review the corresponding pledges:
              </p>
              <div className="p-4 space-y-4">
                {Object.keys(categoryContent).map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={category}
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2"
                    />
                    <label htmlFor={category} className="text-sm font-medium text-[#111418]">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedCategory && (
                <div className="p-4">
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
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111418]">Name:</label>
                      <input type="text" className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111418]">Date:</label>
                      <input type="date" className="mt-1 block w-full p-2 rounded-lg bg-transparent border border-gray-300 bg-opacity-80 text-[#111418]" />
                    </div>
                  </div>
                </div>
              )}
              
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Section 3: Terms and Conditions
              </h3>
              <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">
                By signing this pledge form, I agree to actively participate in the MINY community as outlined above. I understand that my participation helps to foster strong, direct relationships between artists and fans and contributes to the growth and development of the MINY platform.
              </p>
              <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Section 4: Confirmation
              </h3>
              <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">
                Upon submission, you will receive a confirmation email with further instructions on how to engage with the MINY platform and fulfill your pledge commitments.
              </p>
              <div className="flex px-4 py-3 justify-center">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0b6fda] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MinyPledge;