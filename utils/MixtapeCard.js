import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
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
      
      uvs[i * 2] = (x + hexSize) / (2 * hexSize);
      uvs[i * 2 + 1] = (y + hexSize) / (2 * hexSize);
    }
    
    hexGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    return { shape: hexShape, geometry: hexGeometry };
  }, []);

  // Configure texture once
  useEffect(() => {
    // Remove sRGBEncoding, use colorSpace instead
    texture.colorSpace = THREE.SRGBColorSpace;
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


const MixtapeCard = React.memo(({ imageUrl }) => {
  return (
    <div className="w-full max-w-[500px]  mx-auto">
      <div className="relative h-full w-full bg-black rounded-xl overflow-hidden shadow-xl">
        <Canvas 
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          shadows 
          dpr={[1, 2]}
          className="h-full w-full"
          style={{
            width: '100%',
            height: '430px'
          }} 
        >
          <PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <spotLight
            position={[5, 5, 5]}
            angle={0.25}
            penumbra={1}
            intensity={0.5}
            castShadow
          />
          <Environment preset="studio" />
          <Suspense fallback={null}>
            <HexagonMesh
              imageUrl={imageUrl}
              isPlaying={true}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
});

export default MixtapeCard;