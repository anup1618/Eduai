import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Sparkles, Layers, Maximize2 } from 'lucide-react';

interface Watermelon3DModelProps {
  onNodeClick?: (nodeName: string) => void;
  className?: string;
}

export const Watermelon3DModel: React.FC<Watermelon3DModelProps> = ({
  onNodeClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // References to keep track of animation objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const rindMeshRef = useRef<THREE.Mesh | null>(null);
  const pithMeshRef = useRef<THREE.Mesh | null>(null);
  const fleshMeshRef = useRef<THREE.Mesh | null>(null);
  const seedsGroupRef = useRef<THREE.Group | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const isExplodedRef = useRef(false);
  const isRotatingRef = useRef(true);

  // Keep ref synchronized with state for requestAnimationFrame loop
  useEffect(() => {
    isExplodedRef.current = isExploded;
  }, [isExploded]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    materialsRef.current.forEach(mat => {
      if ('wireframe' in mat) {
        (mat as THREE.MeshStandardMaterial).wireframe = isWireframe;
      }
    });
  }, [isWireframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 440;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 4.6);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const pointCoral = new THREE.PointLight(0xff3b5c, 2.4, 10);
    pointCoral.position.set(-2, 2, 2);
    scene.add(pointCoral);

    const pointMint = new THREE.PointLight(0x10b981, 2.0, 10);
    pointMint.position.set(2, -2, 2);
    scene.add(pointMint);

    // 5. Main Model Group
    const modelGroup = new THREE.Group();
    coreGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Store created materials to toggle wireframe
    const createdMaterials: THREE.Material[] = [];

    // Helper: Build a 3D Watermelon Wedge Shape
    // A 90-degree wedge using CylinderGeometry thetaStart & thetaLength
    const sliceAngle = Math.PI * 0.55; // ~100 degrees wedge
    const sliceStart = -sliceAngle / 2;

    // A. Outer Green Rind Layer
    const rindGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.6, 48, 1, false, sliceStart, sliceAngle);
    const rindMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.35,
      metalness: 0.1,
    });
    const rindMesh = new THREE.Mesh(rindGeo, rindMat);
    rindMesh.rotation.x = Math.PI / 2;
    modelGroup.add(rindMesh);
    rindMeshRef.current = rindMesh;
    createdMaterials.push(rindMat);

    // Outer Rind Stripe Rings (Procedural Striping)
    const stripeCount = 5;
    for (let i = 0; i < stripeCount; i++) {
      const stripeAngle = sliceStart + (sliceAngle / (stripeCount + 1)) * (i + 1);
      const stripeGeo = new THREE.BoxGeometry(0.04, 0.61, 0.08);
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.25,
        emissive: 0x065f46,
        emissiveIntensity: 0.4,
      });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(
        Math.cos(stripeAngle) * 1.58,
        0,
        Math.sin(stripeAngle) * 1.58
      );
      stripe.rotation.y = -stripeAngle;
      rindMesh.add(stripe);
      createdMaterials.push(stripeMat);
    }

    // B. Crisp Mint Pith Layer (Slightly smaller radius)
    const pithGeo = new THREE.CylinderGeometry(1.53, 1.53, 0.58, 48, 1, false, sliceStart, sliceAngle);
    const pithMat = new THREE.MeshStandardMaterial({
      color: 0xe6fffa,
      roughness: 0.45,
      metalness: 0.05,
    });
    const pithMesh = new THREE.Mesh(pithGeo, pithMat);
    pithMesh.rotation.x = Math.PI / 2;
    modelGroup.add(pithMesh);
    pithMeshRef.current = pithMesh;
    createdMaterials.push(pithMat);

    // C. Juicy Coral/Ruby Flesh Layer
    const fleshGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.55, 48, 1, false, sliceStart, sliceAngle);
    const fleshMat = new THREE.MeshStandardMaterial({
      color: 0xff3b5c,
      roughness: 0.22,
      metalness: 0.15,
      emissive: 0x880e28,
      emissiveIntensity: 0.25,
    });
    const fleshMesh = new THREE.Mesh(fleshGeo, fleshMat);
    fleshMesh.rotation.x = Math.PI / 2;
    modelGroup.add(fleshMesh);
    fleshMeshRef.current = fleshMesh;
    createdMaterials.push(fleshMat);

    // D. 3D Obsidian Seeds (Teardrop-ish flattened spheres)
    const seedsGroup = new THREE.Group();
    modelGroup.add(seedsGroup);
    seedsGroupRef.current = seedsGroup;

    const seedPositions = [
      { r: 0.6, angle: sliceStart + sliceAngle * 0.25, z: 0.12 },
      { r: 0.9, angle: sliceStart + sliceAngle * 0.35, z: -0.1 },
      { r: 1.15, angle: sliceStart + sliceAngle * 0.45, z: 0.14 },
      { r: 0.75, angle: sliceStart + sliceAngle * 0.65, z: -0.12 },
      { r: 1.1, angle: sliceStart + sliceAngle * 0.72, z: 0.08 },
      { r: 0.5, angle: sliceStart + sliceAngle * 0.5, z: -0.05 },
      { r: 1.25, angle: sliceStart + sliceAngle * 0.28, z: -0.12 },
      { r: 0.95, angle: sliceStart + sliceAngle * 0.8, z: 0.11 },
    ];

    seedPositions.forEach(pos => {
      const seedGeo = new THREE.SphereGeometry(0.045, 12, 12);
      seedGeo.scale(1, 1.7, 0.5); // Flatten and elongate like a real watermelon seed
      const seedMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.85,
      });
      const seedMesh = new THREE.Mesh(seedGeo, seedMat);
      seedMesh.position.set(
        Math.cos(pos.angle) * pos.r,
        Math.sin(pos.angle) * pos.r,
        pos.z
      );
      seedMesh.rotation.z = pos.angle + Math.PI / 2;
      seedsGroup.add(seedMesh);
      createdMaterials.push(seedMat);
    });

    // 6. Orbital Hologram Rings & Interactive Telemetry Nodes
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);
    ringsGroupRef.current = ringsGroup;

    // Ring 1: Mint Orbit
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    ringsGroup.add(ring1);
    createdMaterials.push(ringMat1);

    // Ring 2: Coral Orbit
    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xff3b5c,
      roughness: 0.2,
      emissive: 0xff3b5c,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    ringsGroup.add(ring2);
    createdMaterials.push(ringMat2);

    // Telemetry Orbital Nodes (Clickable & Hoverable)
    const nodesGroup = new THREE.Group();
    ringsGroup.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const telemetryNodes = [
      { name: 'MongoDB Cloud Sync', color: 0x10b981, size: 0.1, ring: 1, angle: 0 },
      { name: 'Academic Early-Warning', color: 0xff3b5c, size: 0.11, ring: 1, angle: Math.PI },
      { name: 'Placement Acceleration', color: 0x3b82f6, size: 0.09, ring: 2, angle: Math.PI / 2 },
      { name: 'Attendance Pulse Radar', color: 0xf59e0b, size: 0.09, ring: 2, angle: (3 * Math.PI) / 2 },
    ];

    const nodeMeshes: THREE.Mesh[] = [];

    telemetryNodes.forEach(node => {
      const nodeGeo = new THREE.SphereGeometry(node.size, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.userData = { name: node.name, info: node };
      nodesGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
      createdMaterials.push(nodeMat);
    });

    // 7. Background Floating Sparkles / Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const coralColor = new THREE.Color(0xff3b5c);
    const mintColor = new THREE.Color(0x10b981);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 8;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 6;

      const pickColor = Math.random() > 0.6 ? coralColor : Math.random() > 0.3 ? mintColor : whiteColor;
      particleColors[i3] = pickColor.r;
      particleColors[i3 + 1] = pickColor.g;
      particleColors[i3 + 2] = pickColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    materialsRef.current = createdMaterials;

    // 8. Interaction State & Mouse Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let mouseCurrentX = 0;
    let mouseCurrentY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseTargetX = x * 0.35;
      mouseTargetY = y * 0.35;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        if (coreGroupRef.current) {
          coreGroupRef.current.rotation.y += deltaX * 0.008;
          coreGroupRef.current.rotation.x += deltaY * 0.008;
        }
      }

      // Raycasting for interactive hover over telemetry nodes
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        setHoveredNode(hit.userData.name);
        container.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging && !prevMouseX) return;
      isDragging = false;

      // Check if user clicked a node without dragging
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0 && onNodeClick) {
        onNodeClick(intersects[0].object.userData.name);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 9. Resize Handler
    const onResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Mouse Parallax easing
      mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.05;
      mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.05;
      camera.position.x = mouseCurrentX * 1.5;
      camera.position.y = 0.8 + mouseCurrentY * 1.2;
      camera.lookAt(0, 0, 0);

      // Auto-rotation of model
      if (isRotatingRef.current && coreGroupRef.current) {
        coreGroupRef.current.rotation.y += 0.007;
        coreGroupRef.current.rotation.z = Math.sin(elapsedTime * 0.5) * 0.08;
      }

      // Orbital rings animation
      if (ringsGroupRef.current) {
        ringsGroupRef.current.rotation.y = elapsedTime * 0.2;
        ringsGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
      }

      // Orbiting nodes position updates
      telemetryNodes.forEach((node, idx) => {
        const mesh = nodeMeshes[idx];
        if (!mesh) return;
        const currentAngle = node.angle + elapsedTime * (node.ring === 1 ? 0.6 : -0.5);
        const radius = node.ring === 1 ? 2.1 : 2.4;
        mesh.position.set(
          Math.cos(currentAngle) * radius,
          Math.sin(currentAngle * 1.5) * 0.35,
          Math.sin(currentAngle) * radius
        );
      });

      // Exploded View Layer Interpolation
      const targetExplode = isExplodedRef.current ? 1 : 0;
      if (rindMeshRef.current && pithMeshRef.current && fleshMeshRef.current && seedsGroupRef.current) {
        // Expand along radial direction
        const currentRindZ = rindMeshRef.current.position.z;
        const targetRindZ = targetExplode * 0.6;
        rindMeshRef.current.position.z += (targetRindZ - currentRindZ) * 0.08;

        const currentPithZ = pithMeshRef.current.position.z;
        const targetPithZ = targetExplode * 0.3;
        pithMeshRef.current.position.z += (targetPithZ - currentPithZ) * 0.08;

        const currentSeedZ = seedsGroupRef.current.position.z;
        const targetSeedZ = targetExplode * -0.4;
        seedsGroupRef.current.position.z += (targetSeedZ - currentSeedZ) * 0.08;
      }

      // Floating particles slow rotation
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      createdMaterials.forEach(m => m.dispose());
    };
  }, []);

  return (
    <div className={`relative w-full h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden"
      />

      {/* Floating Holographic Hover Badge */}
      {hoveredNode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1.5 rounded-full watermelon-glass border border-[#FF3B5C]/40 text-xs font-bold text-text shadow-xl flex items-center gap-2 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>{hoveredNode}</span>
          <span className="text-[10px] text-text-muted font-normal">• Click to inspect</span>
        </div>
      )}

      {/* Interactive 3D Model Control Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl watermelon-glass border border-[#FF3B5C]/25 shadow-xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setIsRotating(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isRotating
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
              : 'text-text-muted hover:text-text hover:bg-card-hover'
          }`}
          title={isRotating ? 'Pause Rotation' : 'Resume Auto-Rotation'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">{isRotating ? 'Rotating' : 'Paused'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExploded(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isExploded
              ? 'bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/40'
              : 'text-text-muted hover:text-text hover:bg-card-hover'
          }`}
          title="Toggle Exploded Layer Architecture View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isExploded ? 'Exploded Layers' : 'Deconstruct'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsWireframe(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isWireframe
              ? 'bg-accent/20 text-accent border border-accent/40'
              : 'text-text-muted hover:text-text hover:bg-card-hover'
          }`}
          title="Toggle Hologram Wireframe Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hologram</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-12 text-[10px] text-text-muted/70 tracking-wide pointer-events-none hidden sm:block">
        3D Interactive • Drag to rotate 360° • Hover nodes
      </div>
    </div>
  );
};
