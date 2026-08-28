import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function AvatarCanvas({ modelUrl, morphWeights = {}, isSpeaking = false, className = '' }) {
  const containerRef = useRef(null);
  const headMeshRef = useRef(null);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(2.5);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 1.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting setup for stylized/warm ambiance
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 1.8);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb4d4ff, 0.8);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    // Load GLTF / GLB Avatar
    const loader = new GLTFLoader();
    let currentModel = null;

    loader.load(
      modelUrl || '/assets/avatar/default_avatar.glb',
      (gltf) => {
        currentModel = gltf.scene;
        scene.add(currentModel);

        currentModel.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
            headMeshRef.current = child;
          }
        });
      },
      undefined,
      (err) => {
        // Procedural stylized fallback avatar mesh
        const headGroup = new THREE.Group();
        
        // Head sphere
        const headGeo = new THREE.SphereGeometry(0.28, 32, 32);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.3 });
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headMesh.position.set(0, 1.4, 0);
        headGroup.add(headMesh);

        // Stylized cartoon hair
        const hairGeo = new THREE.SphereGeometry(0.3, 24, 24);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1d0c, roughness: 0.8 });
        const hairMesh = new THREE.Mesh(hairGeo, hairMat);
        hairMesh.position.set(0, 1.46, -0.02);
        hairMesh.scale.set(1.02, 1.05, 0.95);
        headGroup.add(hairMesh);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.045, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.09, 1.43, 0.25);
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.09, 1.43, 0.25);
        headGroup.add(rightEye);

        // Animated Cartoon Mouth
        const mouthGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x800000 });
        const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
        mouthMesh.position.set(0, 1.30, 0.26);
        headGroup.add(mouthMesh);

        currentModel = headGroup;
        scene.add(currentModel);
      }
    );

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Idle subtle breathing
      if (currentModel) {
        currentModel.position.y = Math.sin(elapsed * 1.5) * 0.008;
        currentModel.rotation.y = Math.sin(elapsed * 0.5) * 0.04;
      }

      // Procedural eye blinking timer
      blinkTimerRef.current += delta;
      let blinkWeight = 0;
      if (blinkTimerRef.current > nextBlinkRef.current) {
        const blinkProgress = (blinkTimerRef.current - nextBlinkRef.current) / 0.15;
        if (blinkProgress <= 1.0) {
          blinkWeight = Math.sin(blinkProgress * Math.PI);
        } else {
          blinkTimerRef.current = 0;
          nextBlinkRef.current = 2.0 + Math.random() * 3.5;
        }
      }

      // Apply morph target influences to 3D mesh
      if (headMeshRef.current && headMeshRef.current.morphTargetDictionary) {
        const dict = headMeshRef.current.morphTargetDictionary;
        const influences = headMeshRef.current.morphTargetInfluences;

        for (const [key, weight] of Object.entries(morphWeights)) {
          if (dict[key] !== undefined) {
            influences[dict[key]] = THREE.MathUtils.lerp(influences[dict[key]], weight, 0.35);
          }
        }

        if (dict['eyeBlinkLeft'] !== undefined) influences[dict['eyeBlinkLeft']] = blinkWeight;
        if (dict['eyeBlinkRight'] !== undefined) influences[dict['eyeBlinkRight']] = blinkWeight;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return <div ref={containerRef} className={`relative w-full h-full min-h-[360px] ${className}`} />;
}
