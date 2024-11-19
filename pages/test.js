
import React from 'react'

function test() {
  return (
    <div>test</div>
  )
}

export default test

// import React, { useState, Suspense, useCallback } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
// import { ExternalLink } from 'lucide-react';
// import HexagonMesh from '@/utils/HexagonMesh';

// const mixtapes = [
//   {
//     name: "structure pulse",
//     imageUrl: "https://minyfy.subwaymusician.xyz/grammybg.png",
//     shortenedLink: "https://go.minyvinyl.com/rkmix"
//   },
//   {
//     name: "burnout pre save",
//     imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny%20Vinyl%20Playlist%20(Mixtape)%20featuring%20tracks%20-%20Die-With-A-Smile---Lady-Gaga---APT.---ROS%C3%89---BIRDS-OF-A-FEATHER---Billie-Eilish---That%E2%80%99s-So-True---Gracie-Abrams.webp?alt=media&token=9be50bc2-15dd-4b82-94ab-857f750d2526",
//     shortenedLink: "https://go.minyvinyl.com/canvasburnout"
//   },
//   {
//     name: "diesel dust",
//     imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6556a229-bb98-4bca-954b-1712fa62d9ae?alt=media&token=25eea789-5dc6-47a6-b722-ecc9e20d8240",
//     shortenedLink: "https://go.minyvinyl.com/dieseldust"
//   },
//   {
//     name: "structure pulse",
//     imageUrl: "https://minyfy.subwaymusician.xyz/grammybg.png",
//     shortenedLink: "https://go.minyvinyl.com/rkmix"
//   },
//   {
//     name: "burnout pre save",
//     imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/a-mixtapes%2FMiny%20Vinyl%20Playlist%20(Mixtape)%20featuring%20tracks%20-%20Die-With-A-Smile---Lady-Gaga---APT.---ROS%C3%89---BIRDS-OF-A-FEATHER---Billie-Eilish---That%E2%80%99s-So-True---Gracie-Abrams.webp?alt=media&token=9be50bc2-15dd-4b82-94ab-857f750d2526",
//     shortenedLink: "https://go.minyvinyl.com/canvasburnout"
//   },
//   {
//     name: "diesel dust",
//     imageUrl: "https://firebasestorage.googleapis.com/v0/b/subway-musician-564bd.appspot.com/o/aminy-generation%2Fminy-6556a229-bb98-4bca-954b-1712fa62d9ae?alt=media&token=25eea789-5dc6-47a6-b722-ecc9e20d8240",
//     shortenedLink: "https://go.minyvinyl.com/dieseldust"
//   },
  
// ];

// const MixtapeCard = React.memo(({ mixtape }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div
//       className="relative h-[500px] bg-gradient-to-br from-gray-900 to-neutral-900 rounded-xl overflow-hidden shadow-xl group transform transition-transform hover:scale-[1.02]"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <Canvas 
//         gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
//         shadows 
//         dpr={[1, 2]}
//       >
//         <PerspectiveCamera makeDefault position={[0, 0, 3]} />
//         <OrbitControls
//           enablePan={false}
//           enableZoom={false}
//           minPolarAngle={Math.PI / 3}
//           maxPolarAngle={Math.PI / 2}
//         />
//         <ambientLight intensity={0.5} />
//         <spotLight
//           position={[5, 5, 5]}
//           angle={0.25}
//           penumbra={1}
//           intensity={0.5}
//           castShadow
//         />
//         <Environment preset="studio" />
//         <Suspense fallback={null}>
//           <HexagonMesh
//             imageUrl={mixtape.imageUrl}
//             isPlaying={isHovered}
//           />
//         </Suspense>
//       </Canvas>

//       <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-2xl font-bold text-white capitalize mb-2">
//               {mixtape.name}
//             </h3>
//             <a
//               href={mixtape.shortenedLink}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
//             >
//               Listen Now
//               <ExternalLink className="w-4 h-4" />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// const MixtapeGrid = () => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-6 gap-16 max-w-[1800px] mx-auto">
//       {mixtapes.map((mixtape) => (
//         <MixtapeCard key={mixtape.name} mixtape={mixtape} />
//       ))}
//     </div>
//   );
// };

// export default MixtapeGrid;