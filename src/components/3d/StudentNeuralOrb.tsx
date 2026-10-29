import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StudentNeuralOrbProps {
  score?: number;
  className?: string;
  size?: number;
}

export const StudentNeuralOrb: React.FC<StudentNeuralOrbProps> = ({
  score = 84,
  className = '',
  size = 130,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2af5c8, 3, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    // Inner Core Sphere
    const coreColor = score >= 75 ? 0x2af5c8 : 0xf59e0b;
    const coreGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      emissive: coreColor,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Outer Wireframe Hologram
    const wireGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Dynamic Orbital Energy Ring
    const ringGeo = new THREE.TorusGeometry(0.95, 0.015, 12, 60);
    const ringMat = new THREE.MeshBasicMaterial({
      color: coreColor,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.rotation.y = Math.PI / 6;
    group.add(ring);

    // Knowledge Particles
    const pCount = 35;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.05 + Math.random() * 0.3;
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: coreColor,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      group.rotation.y = elapsed * 0.6 + mouseX * 0.5;
      group.rotation.x = Math.sin(elapsed * 0.8) * 0.2 + mouseY * 0.3;

      const pulse = 1 + Math.sin(elapsed * 3) * 0.04;
      coreMesh.scale.set(pulse, pulse, pulse);

      ring.rotation.z = elapsed * 1.2;
      particles.rotation.y = -elapsed * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [score, size]);

  return (
    <div
      ref={containerRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative select-none flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      title="Interactive 3D Student AI Learning Orb (Hover to tilt)"
    />
  );
};

