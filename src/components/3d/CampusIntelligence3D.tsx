import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  RotateCw, Eye, Sparkles, Activity, ShieldAlert,
  GraduationCap, Users, RefreshCw, ZoomIn, Layers
} from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';
import { evaluateAcademicRisk } from '../../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../../engine/placementRiskEngine';

interface DepartmentNodeInfo {
  name: string;
  shortName: string;
  color: number;
  hexColor: string;
  totalStudents: number;
  avgCgpa: number;
  highRiskCount: number;
  highRiskPct: number;
  placementScore: number;
  position: [number, number, number];
}

interface CampusIntelligence3DProps {
  onSelectDepartment?: (dept: string) => void;
  className?: string;
}

export const CampusIntelligence3D: React.FC<CampusIntelligence3DProps> = ({
  onSelectDepartment,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { filteredStudents, academicThresholds, placementThresholds, setFilters } = useCampusData();

  const [isRotating, setIsRotating] = useState(true);
  const [showSynapses, setShowSynapses] = useState(true);
  const [riskHeatmap, setRiskHeatmap] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentNodeInfo | null>(null);
  const [hoveredDept, setHoveredDept] = useState<DepartmentNodeInfo | null>(null);

  // Compute live department statistics from MongoDB student records
  const departmentsData: DepartmentNodeInfo[] = useMemo(() => {
    const depts = [
      { name: 'Computer Science', shortName: 'CSE', color: 0x06b6d4, hexColor: '#06B6D4', pos: [-2.2, 0.4, 0.8] as [number, number, number] },
      { name: 'Information Technology', shortName: 'IT', color: 0x3b82f6, hexColor: '#3B82F6', pos: [2.1, 0.6, 0.6] as [number, number, number] },
      { name: 'Electronics & Comm.', shortName: 'ECE', color: 0xa855f7, hexColor: '#A855F7', pos: [-1.4, -1.2, 1.4] as [number, number, number] },
      { name: 'Mechanical Eng.', shortName: 'MECH', color: 0xf59e0b, hexColor: '#F59E0B', pos: [1.6, -1.1, 1.2] as [number, number, number] },
      { name: 'Civil Eng.', shortName: 'CIVIL', color: 0x10b981, hexColor: '#10B981', pos: [0.1, 1.8, -0.6] as [number, number, number] },
    ];

    return depts.map(d => {
      const deptStudents = filteredStudents.filter(s => s.department === d.name);
      const total = deptStudents.length || 1;
      const validCgpa = deptStudents.filter(s => s.academic.cgpa !== null).map(s => s.academic.cgpa as number);
      const avgCgpa = validCgpa.length > 0 ? validCgpa.reduce((a, b) => a + b, 0) / validCgpa.length : 8.0;

      const highRisk = deptStudents.filter(s => evaluateAcademicRisk(s, academicThresholds).risk_level === 'High').length;
      const pScores = deptStudents.map(s => evaluatePlacementRisk(s, placementThresholds).readiness_score ?? 75);
      const avgPlacement = Math.round(pScores.reduce((a, b) => a + b, 0) / (pScores.length || 1));

      return {
        name: d.name,
        shortName: d.shortName,
        color: d.color,
        hexColor: d.hexColor,
        totalStudents: deptStudents.length,
        avgCgpa: Math.round(avgCgpa * 100) / 100,
        highRiskCount: highRisk,
        highRiskPct: Math.round((highRisk / total) * 100),
        placementScore: avgPlacement,
        position: d.pos,
      };
    });
  }, [filteredStudents, academicThresholds, placementThresholds]);

  // Three.js animation and scene references
  const isRotatingRef = useRef(isRotating);
  const showSynapsesRef = useRef(showSynapses);
  const riskHeatmapRef = useRef(riskHeatmap);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    showSynapsesRef.current = showSynapses;
  }, [showSynapses]);

  useEffect(() => {
    riskHeatmapRef.current = riskHeatmap;
  }, [riskHeatmap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 6.2);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const pointMint = new THREE.PointLight(0x10b981, 2.5, 12);
    pointMint.position.set(-3, 3, 3);
    scene.add(pointMint);

    const pointCyan = new THREE.PointLight(0x06b6d4, 2.0, 12);
    pointCyan.position.set(3, -2, 3);
    scene.add(pointCyan);

    // 5. Root Campus Universe Group
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // ─── A. Central Institutional AI Neural Core ──────────────────────────────
    const coreGroup = new THREE.Group();
    universeGroup.add(coreGroup);

    // Inner glowing sphere
    const coreGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer wireframe energy sphere
    const wireGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2af5c8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // Concentric Energy Rings
    const ringGeo1 = new THREE.TorusGeometry(1.05, 0.012, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x2af5c8, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.2, 0.01, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3;
    coreGroup.add(ring2);

    // ─── B. Department Planetary Nodes ─────────────────────────────────────────
    const deptMeshList: { mesh: THREE.Mesh; info: DepartmentNodeInfo; beaconMesh?: THREE.Mesh }[] = [];
    const deptObjectsGroup = new THREE.Group();
    universeGroup.add(deptObjectsGroup);

    departmentsData.forEach(dept => {
      const deptGroup = new THREE.Group();
      deptGroup.position.set(...dept.position);
      deptObjectsGroup.add(deptGroup);

      // Planetary Sphere
      const pGeo = new THREE.SphereGeometry(0.38, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: dept.color,
        emissive: dept.color,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.2,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.userData = { dept };
      deptGroup.add(pMesh);

      // Atmospheric Halo
      const haloGeo = new THREE.RingGeometry(0.44, 0.48, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: dept.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      deptGroup.add(halo);

      // High Risk Warning Beacon (Pulsing Red Sphere if High Risk > 15%)
      let beacon: THREE.Mesh | undefined;
      if (dept.highRiskPct >= 15) {
        const bGeo = new THREE.SphereGeometry(0.52, 16, 16);
        const bMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          wireframe: true,
          transparent: true,
          opacity: 0.7,
        });
        beacon = new THREE.Mesh(bGeo, bMat);
        deptGroup.add(beacon);
      }

      // Department Student Swarm (Mini Satellites)
      const count = Math.min(dept.totalStudents, 20);
      for (let s = 0; s < count; s++) {
        const angle = (s / count) * Math.PI * 2;
        const radius = 0.6 + (s % 3) * 0.12;
        const satGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const isRisk = s < dept.highRiskCount;
        const satMat = new THREE.MeshBasicMaterial({
          color: isRisk ? 0xef4444 : dept.color,
        });
        const sat = new THREE.Mesh(satGeo, satMat);
        sat.position.set(Math.cos(angle) * radius, Math.sin(s * 1.5) * 0.15, Math.sin(angle) * radius);
        deptGroup.add(sat);
      }

      deptMeshList.push({ mesh: pMesh, info: dept, beaconMesh: beacon });
    });

    // ─── C. Synaptic Neural Connection Lines ──────────────────────────────────
    const synapsesGroup = new THREE.Group();
    universeGroup.add(synapsesGroup);

    departmentsData.forEach(dept => {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(dept.position[0] * 0.5, dept.position[1] * 0.5 + 0.3, dept.position[2] * 0.5),
        new THREE.Vector3(...dept.position),
      ];
      const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.015, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: dept.color,
        transparent: true,
        opacity: 0.5,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      synapsesGroup.add(tube);
    });

    // ─── D. Campus Neural Background Particles ────────────────────────────────
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cMint = new THREE.Color(0x10b981);
    const cCyan = new THREE.Color(0x06b6d4);
    const cCoral = new THREE.Color(0xff3b5c);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 11;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 8;

      const pick = Math.random();
      const col = pick > 0.6 ? cMint : pick > 0.3 ? cCyan : pick > 0.15 ? cCoral : cWhite;
      particleColors[i3] = col.r;
      particleColors[i3 + 1] = col.g;
      particleColors[i3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    universeGroup.add(particles);

    // ─── E. Interactive Orbit & Mouse Pointer ─────────────────────────────────
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
      mouseTargetX = x * 0.4;
      mouseTargetY = y * 0.4;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        universeGroup.rotation.y += deltaX * 0.007;
        universeGroup.rotation.x += deltaY * 0.007;
      }

      // Raycasting to hover/detect department nodes
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const targetMeshes = deptMeshList.map(d => d.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const info = hit.userData.dept as DepartmentNodeInfo;
        setHoveredDept(info);
        container.style.cursor = 'pointer';
      } else {
        setHoveredDept(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging && !prevMouseX) return;
      isDragging = false;

      // Click detection
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const targetMeshes = deptMeshList.map(d => d.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const info = hit.userData.dept as DepartmentNodeInfo;
        setSelectedDept(info);
        if (onSelectDepartment) onSelectDepartment(info.name);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ─── F. Resize Handling ──────────────────────────────────────────────────
    const onResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', onResize);

    // ─── G. Render / Animation Loop ──────────────────────────────────────────
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Mouse Parallax
      mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.05;
      mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.05;
      camera.position.x = mouseCurrentX * 1.2;
      camera.position.y = 1.2 + mouseCurrentY * 0.9;
      camera.lookAt(0, 0, 0);

      // Auto-Orbit Universe
      if (isRotatingRef.current) {
        universeGroup.rotation.y += 0.005;
      }

      // Pulse Core
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.06;
      coreGroup.scale.set(pulse, pulse, pulse);
      wireMesh.rotation.y = elapsedTime * 0.5;
      wireMesh.rotation.x = elapsedTime * 0.3;
      ring1.rotation.z = elapsedTime * 0.8;
      ring2.rotation.z = -elapsedTime * 0.6;

      // Synapses visibility
      synapsesGroup.visible = showSynapsesRef.current;

      // Beacon Animations (Warning Pulses)
      deptMeshList.forEach((item, idx) => {
        if (item.beaconMesh) {
          const bScale = riskHeatmapRef.current ? 1.2 + Math.sin(elapsedTime * 4 + idx) * 0.25 : 1 + Math.sin(elapsedTime * 3 + idx) * 0.15;
          item.beaconMesh.scale.set(bScale, bScale, bScale);
          (item.beaconMesh.material as THREE.MeshBasicMaterial).opacity = riskHeatmapRef.current ? 0.9 : 0.45;
        }
      });

      // Background particles drift
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // ─── H. Cleanup on Unmount ───────────────────────────────────────────────
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
      scene.clear();
    };
  }, [departmentsData]);

  return (
    <div className={`relative w-full rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden shadow-spec-hover ${className}`}>
      {/* 3D Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-border/80 bg-sidebar/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Activity className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text">3D Campus AI Neural Digital Twin</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                WebGL 3D Telemetry
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              Interactive spatial network mapping student retention, department health, and risk beacons
            </p>
          </div>
        </div>

        {/* 3D Interactive Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRotating(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRotating
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'bg-card text-text-muted hover:text-text border border-border'
            }`}
            title={isRotating ? 'Pause Orbit' : 'Resume Auto-Orbit'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">{isRotating ? 'Orbiting' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRiskHeatmap(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              riskHeatmap
                ? 'bg-status-danger/20 text-status-danger border border-status-danger/40'
                : 'bg-card text-text-muted hover:text-text border border-border'
            }`}
            title="Toggle Risk Heatmap Beacons"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSynapses(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showSynapses
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'bg-card text-text-muted hover:text-text border border-border'
            }`}
            title="Toggle Neural Synapse Data Beams"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Synapses</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px]">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

        {/* Floating Tooltip HUD on Node Hover */}
        {(hoveredDept || selectedDept) && (
          <div className="absolute top-4 left-4 z-20 p-3.5 rounded-xl bg-sidebar/95 border border-border/90 shadow-2xl backdrop-blur-md max-w-xs animate-fade-up">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: (hoveredDept || selectedDept)?.hexColor }}
                />
                <span className="text-xs font-bold text-text truncate">
                  {(hoveredDept || selectedDept)?.name}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-card text-text-muted">
                {(hoveredDept || selectedDept)?.shortName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
              <div>
                <span className="text-[10px] text-text-muted block">Enrolled Students</span>
                <span className="font-bold text-text">{(hoveredDept || selectedDept)?.totalStudents}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Average CGPA</span>
                <span className="font-bold text-accent">{(hoveredDept || selectedDept)?.avgCgpa} / 10</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Academic Risk</span>
                <span className={`font-bold ${((hoveredDept || selectedDept)?.highRiskPct ?? 0) > 15 ? 'text-status-danger' : 'text-status-success'}`}>
                  {(hoveredDept || selectedDept)?.highRiskCount} ({ (hoveredDept || selectedDept)?.highRiskPct }%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Placement Score</span>
                <span className="font-bold text-text">{(hoveredDept || selectedDept)?.placementScore}/100</span>
              </div>
            </div>

            <div className="pt-2.5 mt-2 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const dept = (hoveredDept || selectedDept)?.name;
                  if (dept) setFilters({ department: dept as any });
                }}
                className="w-full py-1 px-2 rounded-lg bg-accent/15 border border-accent/30 text-accent text-[11px] font-bold hover:bg-accent/25 transition text-center"
              >
                Filter Cohort to this Dept →
              </button>
            </div>
          </div>
        )}

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl bg-sidebar/85 border border-border/80 backdrop-blur-md text-[10px] space-y-1.5 hidden sm:block">
          <div className="font-bold text-text flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Interactive Campus Network</span>
          </div>
          <div className="flex items-center gap-3 text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" /> CSE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> IT
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" /> ECE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> MECH
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> CIVIL
            </span>
          </div>
        </div>

        {/* Hint at Bottom-Right */}
        <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-sidebar/80 border border-border/80 text-[10px] text-text-muted font-medium backdrop-blur-md">
          Drag to Orbit 360° • Click node to inspect details
        </div>
      </div>
    </div>
  );
};
export default CampusIntelligence3D;

