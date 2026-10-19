import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControlsProps {
  mode: 'perspective' | 'top-down' | 'isometric';
}

export const CameraControls: React.FC<CameraControlsProps> = ({ mode }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (mode === 'top-down') {
      camera.position.set(0, 22, 1.21);
      camera.lookAt(0, 0, 1.2);
      controlsRef.current.target.set(0, 0, 1.2);
      controlsRef.current.maxPolarAngle = 0.05;
      controlsRef.current.minPolarAngle = 0;
    } else if (mode === 'isometric') {
      // Elevated architectural isometric perspective (~50° polar angle, filling ~75% of viewport)
      camera.position.set(10.2, 12.2, 10.2);
      camera.lookAt(0, 0, 1.2);
      controlsRef.current.target.set(0, 0, 1.2);
      controlsRef.current.maxPolarAngle = Math.PI * 0.45;
      controlsRef.current.minPolarAngle = Math.PI * 0.15;
    } else {
      // Orbit perspective view (~50° polar angle)
      camera.position.set(0, 12.0, 14.5);
      camera.lookAt(0, 0, 1.2);
      controlsRef.current.target.set(0, 0, 1.2);
      controlsRef.current.maxPolarAngle = Math.PI * 0.48;
      controlsRef.current.minPolarAngle = Math.PI * 0.1;
    }

    controlsRef.current.update();
  }, [mode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={45}
      target={[0, 0, 1.2]}
    />
  );
};
