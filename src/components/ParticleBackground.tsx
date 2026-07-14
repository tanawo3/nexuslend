import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const SciFiStructure = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && wireframeRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x = Math.sin(t / 4) / 2;
      meshRef.current.rotation.y = t * 0.2;
      wireframeRef.current.rotation.x = Math.sin(t / 4) / 2;
      wireframeRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <group scale={1.5}>
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[2, 0.4, 256, 64]} />
          <meshPhysicalMaterial 
            color="#000000" 
            metalness={1} 
            roughness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh ref={wireframeRef}>
          <torusKnotGeometry args={[2, 0.4, 64, 16]} />
          <meshBasicMaterial 
            color="#00ffaa" 
            wireframe 
            transparent 
            opacity={0.15} 
          />
        </mesh>
      </group>
    </Float>
  );
};

const GridFloor = () => {
  return (
    <gridHelper args={[50, 50, '#00ffaa', '#00ffaa']} position={[0, -4, 0]} rotation={[0, 0, 0]}>
      <material attach="material" transparent opacity={0.05} />
    </gridHelper>
  );
};

export const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <fog attach="fog" args={['#000000', 5, 15]} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00ffaa" />
        <SciFiStructure />
        <GridFloor />
      </Canvas>
    </div>
  );
};
