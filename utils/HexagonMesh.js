import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {sRGBEncoding} from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const HexagonMesh = React.memo(({ imageUrl, isPlaying }) => {
  const meshRef = useRef(null);
  const texture = useTexture(imageUrl);

  // Memoize shape and geometry creation
  const { shape, geometry } = useMemo(() => {
    const hexSize = 1;
    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const x = hexSize * Math.cos(angle);
      const y = hexSize * Math.sin(angle);
      i === 0 ? hexShape.moveTo(x, y) : hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const hexGeometry = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    });

    // Generate UVs
    const pos = hexGeometry.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.array[i * 3];
      const y = pos.array[i * 3 + 1];
      
      uvs[i * 2] = (x + hexSize) / (1.97 * hexSize);
      uvs[i * 2 + 1] = (y + hexSize) / (2.02 * hexSize);
    }
    
    hexGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    return { shape: hexShape, geometry: hexGeometry };
  }, []);

  // Configure texture once
  useEffect(() => {
    texture.encoding = sRGBEncoding;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.needsUpdate = true;
  }, [texture]);

  // Animation frame
  useFrame((state) => {
    if (isPlaying && meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, 0, 0]}>
      <meshStandardMaterial
        map={texture}
        metalness={0.3}
        roughness={0.4}
        envMapIntensity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

export default HexagonMesh;

// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { useFrame } from '@react-three/fiber';
// import { useTexture } from '@react-three/drei';

// const HexagonMesh = ({ imageUrl, isPlaying }) => {
//   const meshRef = useRef(null);
//   const texture = useTexture(imageUrl);

//   // Configure texture
//   useEffect(() => {
//     texture.encoding = THREE.sRGBEncoding;
//     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//     texture.repeat.set(1, 1);
//     texture.needsUpdate = true;
//   }, [texture]);

//   // Create hexagon shape
//   const shape = new THREE.Shape();
//   const size = 1;
//   for (let i = 0; i < 6; i++) {
//     const angle = (i * Math.PI) / 3 - Math.PI / 2;
//     const x = size * Math.cos(angle);
//     const y = size * Math.sin(angle);
//     i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
//   }
//   shape.closePath();

//   // Generate UV coordinates for proper texture mapping
//   const generateUVs = (geometry) => {
//     const pos = geometry.attributes.position;
//     const uvs = new Float32Array(pos.count * 2);
    
//     for (let i = 0; i < pos.count; i++) {
//       const x = pos.array[i * 3];
//       const y = pos.array[i * 3 + 1];
//       const z = pos.array[i * 3 + 2];
      
//       // Map position to UV coordinates
//       uvs[i * 2] = (x + size) / (1.97 * size);
//       uvs[i * 2 + 1] = (y + size) / (2.02 * size);
//     }
    
//     geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
//     return geometry;
//   };

//   useFrame((state) => {
//     if (isPlaying && meshRef.current) {
//       meshRef.current.rotation.y += 0.01;
//       meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
//     }
//   });

//   return (
//     <mesh ref={meshRef} rotation={[0, 0, 0]}>
//       <extrudeGeometry
//         args={[shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }]}
//         onUpdate={(geometry) => generateUVs(geometry)}
//       />
//       <meshStandardMaterial
//         map={texture}
//         metalness={0.3}
//         roughness={0.4}
//         envMapIntensity={0.8}
//         side={THREE.DoubleSide}
//       />
//     </mesh>
//   );
// };

// export default HexagonMesh;
