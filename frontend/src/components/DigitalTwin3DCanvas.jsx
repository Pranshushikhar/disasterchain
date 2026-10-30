import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useCrisisSimulation } from '../context/CrisisSimulationContext';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

export default function DigitalTwin3DCanvas({ onSelectBuilding, selectedBuildingId, activeLayers }) {
  const mountRef = useRef(null);
  const {
    floodLevelMeters,
    roadStatuses,
    buildings,
    districtMeta,
    selectedScenarioId,
  } = useCrisisSimulation();

  const [webglSupported, setWebglSupported] = useState(true);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  // References to 3D objects for dynamic updates
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const waterMeshRef = useRef(null);
  const buildingMeshesRef = useRef([]);
  const bridgeMeshesRef = useRef({});
  const animationFrameId = useRef(null);

  // Camera Orbit State
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraRadius = useRef(140);
  const cameraAngleTheta = useRef(Math.PI / 4); // Horizontal azimuth
  const cameraAnglePhi = useRef(Math.PI / 3);   // Vertical elevation

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const r = cameraRadius.current;
    const theta = cameraAngleTheta.current;
    const phi = cameraAnglePhi.current;

    cameraRef.current.position.x = r * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = r * Math.cos(phi);
    cameraRef.current.position.z = r * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF1EBDD); // Warm parchment background
    scene.fog = new THREE.FogExp2(0xF1EBDD, 0.0035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(80, 120, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 400;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    // Subtle blue fill light representing sky reflection
    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.6);
    fillLight.position.set(-60, 40, -60);
    scene.add(fillLight);

    // 5. Ground Terrain & Grid
    const groundGeo = new THREE.PlaneGeometry(240, 240, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xE7DECD, // Warm sand / earth
      roughness: 0.9,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Subtle Grid Helper
    const gridHelper = new THREE.GridHelper(240, 24, 0x496B5A, 0xD8B98A);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 6. Saraswati River Valley Channel (Runs along X-axis around Z=0)
    const riverBedGeo = new THREE.PlaneGeometry(240, 26);
    const riverBedMat = new THREE.MeshStandardMaterial({
      color: 0x3d5c58, // River bottom silt
      roughness: 0.8,
    });
    const riverBed = new THREE.Mesh(riverBedGeo, riverBedMat);
    riverBed.rotation.x = -Math.PI / 2;
    riverBed.position.set(0, -0.4, 0);
    scene.add(riverBed);

    // 7. Dynamic River Water Plane
    const waterGeo = new THREE.PlaneGeometry(240, 26, 16, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x5D8990, // DisasterChain water cyan
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.82,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, 0.2, 0);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 8. 3D Bridges Spanning Saraswati River
    // Bridge 1: Saraswati Central Bridge (Old Masonry, Z: -15 to +15 at X: -25)
    const br1Geo = new THREE.BoxGeometry(7, 2.4, 28);
    const br1Mat = new THREE.MeshStandardMaterial({ color: 0xB86F52, roughness: 0.7 });
    const br1Mesh = new THREE.Mesh(br1Geo, br1Mat);
    br1Mesh.position.set(-25, 1.4, 0);
    br1Mesh.castShadow = true;
    br1Mesh.receiveShadow = true;
    scene.add(br1Mesh);
    bridgeMeshesRef.current['bridge-1'] = br1Mesh;

    // Bridge 2: North Elevated Flyover (High elevation concrete, Z: -15 to +15 at X: 35)
    const br2Geo = new THREE.BoxGeometry(8, 2.0, 32);
    const br2Mat = new THREE.MeshStandardMaterial({ color: 0x496B5A, roughness: 0.4 });
    const br2Mesh = new THREE.Mesh(br2Geo, br2Mat);
    br2Mesh.position.set(35, 6.5, 0); // Elevated +6.5m!
    br2Mesh.castShadow = true;
    br2Mesh.receiveShadow = true;
    scene.add(br2Mesh);
    bridgeMeshesRef.current['bridge-2'] = br2Mesh;

    // 9. Buildings Meshes Extrusion
    const meshes = [];
    buildings.forEach((bld) => {
      const bGeo = new THREE.BoxGeometry(bld.width || 12, bld.height || 20, bld.depth || 12);
      const bColor = new THREE.Color(bld.color || '#D8B98A');
      const bMat = new THREE.MeshStandardMaterial({
        color: bColor,
        roughness: 0.6,
        metalness: 0.15,
      });

      const mesh = new THREE.Mesh(bGeo, bMat);
      // Position center Y at half height so building rests on ground
      mesh.position.set(bld.x, (bld.height || 20) / 2, bld.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = bld;

      // Add edge highlight wireframe
      const edges = new THREE.EdgesGeometry(bGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x263F35, linewidth: 1, transparent: true, opacity: 0.25 })
      );
      mesh.add(line);

      scene.add(mesh);
      meshes.push(mesh);
    });
    buildingMeshesRef.current = meshes;

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle water wave pulse
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = (floodLevelMeters * 1.2) + Math.sin(elapsedTime * 2.0) * 0.12;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 11. Mouse Drag / Orbit Controls
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      // Raycasting for building hover & click
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshesRef.current);

      if (intersects.length > 0) {
        const topBld = intersects[0].object.userData;
        setHoveredBuilding(topBld);
        container.style.cursor = 'pointer';
      } else {
        setHoveredBuilding(null);
        container.style.cursor = isDragging.current ? 'grabbing' : 'grab';
      }

      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      cameraAngleTheta.current -= deltaX * 0.008;
      cameraAnglePhi.current = Math.max(0.15, Math.min(Math.PI / 2.1, cameraAnglePhi.current - deltaY * 0.008));

      updateCameraPosition();
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshesRef.current);

      if (intersects.length > 0) {
        const selected = intersects[0].object.userData;
        if (onSelectBuilding) onSelectBuilding(selected);
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      cameraRadius.current = Math.max(40, Math.min(260, cameraRadius.current + e.deltaY * 0.12));
      updateCameraPosition();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('wheel', handleWheel);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [buildings, updateCameraPosition, onSelectBuilding]);

  // Update Bridge Meshes based on Simulation roadStatuses
  useEffect(() => {
    if (!bridgeMeshesRef.current) return;

    const br1 = bridgeMeshesRef.current['bridge-1'];
    if (br1) {
      const st = roadStatuses['bridge-1'];
      if (st === 'submerged' || st === 'blocked') {
        br1.material.color.setHex(0xC94B4B); // Red for closed/submerged
      } else {
        br1.material.color.setHex(0xB86F52);
      }
    }
  }, [roadStatuses]);

  // Zoom Helpers
  const handleZoomIn = () => {
    cameraRadius.current = Math.max(45, cameraRadius.current - 20);
    updateCameraPosition();
  };

  const handleZoomOut = () => {
    cameraRadius.current = Math.min(240, cameraRadius.current + 20);
    updateCameraPosition();
  };

  const handleResetView = () => {
    cameraRadius.current = 140;
    cameraAngleTheta.current = Math.PI / 4;
    cameraAnglePhi.current = Math.PI / 3;
    updateCameraPosition();
  };

  if (!webglSupported) {
    return (
      <div
        style={{
          height: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--dc-surface)',
          borderRadius: 12,
          padding: 24,
          border: '1.5px solid var(--border-medium)',
        }}
      >
        <Info size={36} color="var(--dc-earth-green)" style={{ marginBottom: 12 }} />
        <h3 style={{ margin: 0, color: 'var(--dc-forest)' }}>2D Digital Twin Isometric Mode</h3>
        <p style={{ margin: '8px 0 16px', fontSize: '0.86rem', color: 'var(--dc-text-secondary)', textAlign: 'center', maxWidth: 500 }}>
          WebGL hardware acceleration is not active in this browser viewport. Rendering high-fidelity 2D district schematic for Saraswati Nagar.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, width: '100%', maxWidth: 700 }}>
          {buildings.slice(0, 6).map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBuilding && onSelectBuilding(b)}
              style={{
                padding: 12,
                borderRadius: 8,
                background: 'var(--dc-elevated)',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--dc-forest)' }}>{b.name}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--dc-text-secondary)', marginTop: 4 }}>
                Occupants: {b.occupants} • Flood Risk: {b.floodRisk}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 560, borderRadius: 12, overflow: 'hidden' }}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: 560 }} />

      {/* 3D Canvas Overlay Controls */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            background: 'var(--dc-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
            color: 'var(--dc-forest)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            background: 'var(--dc-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
            color: 'var(--dc-forest)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleResetView}
          title="Reset Orbit Perspective"
          style={{
            background: 'var(--dc-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
            color: 'var(--dc-forest)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Dynamic Water Gauge Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(255, 253, 248, 0.94)',
          border: '1.5px solid var(--border-medium)',
          borderRadius: 8,
          padding: '8px 14px',
          boxShadow: '0 4px 14px rgba(38, 63, 53, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 10,
        }}
      >
        <span className="dc-brand-earth-dot" style={{ background: 'var(--dc-water)' }} />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--dc-text-secondary)', textTransform: 'uppercase' }}>
            Live 3D Hydrology
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--dc-forest)' }}>
            Gauge: {floodLevelMeters.toFixed(2)}m (Dynamic Mesh Sync)
          </div>
        </div>
      </div>

      {/* Building Hover Tooltip */}
      {hoveredBuilding && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'rgba(38, 63, 53, 0.92)',
            color: '#FFF',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '0.8rem',
            pointerEvents: 'none',
            zIndex: 10,
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{hoveredBuilding.name}</div>
          <div style={{ fontSize: '0.74rem', color: '#D8B98A', marginTop: 2 }}>
            Sector: {hoveredBuilding.sector?.toUpperCase()} • Material: {hoveredBuilding.material}
          </div>
          <div style={{ fontSize: '0.74rem', marginTop: 2 }}>
            Occupants: {hoveredBuilding.occupants} | Flood Exposure: {hoveredBuilding.floodRisk}%
          </div>
        </div>
      )}
    </div>
  );
}
