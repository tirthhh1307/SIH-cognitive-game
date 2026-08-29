import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MORPH_ALIASES, resolveMorphIndex } from '../../utils/avatar/visemeMapper.js';

const MODEL_URL = '/models/avatar-companion.vrm';

export default function AvatarCanvas({
  modelUrl = MODEL_URL,
  morphWeights = {},
  targetWeightsRef,
  textureUrl,
  reducedMotion = false,
  onUnavailable,
  className = ''
}) {
  const containerRef = useRef(null);
  const fallbackWeightsRef = useRef(morphWeights);
  const unavailableRef = useRef(onUnavailable);

  useEffect(() => { fallbackWeightsRef.current = morphWeights; }, [morphWeights]);
  useEffect(() => { unavailableRef.current = onUnavailable; }, [onUnavailable]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 1.7);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      unavailableRef.current?.();
      return undefined;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff4df, 0x476b61, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffedcf, 2.2);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const morphMeshes = [];
    let currentModel;
    let customTexture;
    let frameId;
    let disposed = false;
    let blinkStartedAt = 0;
    let nextBlinkAt = 2.8;
    const timer = new THREE.Timer();
    timer.connect(document);

    const applyTexture = model => {
      if (!textureUrl) return;
      new THREE.TextureLoader().load(textureUrl, texture => {
        if (disposed) {
          texture.dispose();
          return;
        }
        customTexture = texture;
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        model.traverse(child => {
          if (!child.isMesh || !child.name.toLowerCase().includes('face')) return;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.filter(Boolean).forEach(material => {
            material.map = texture;
            material.needsUpdate = true;
          });
        });
      });
    };

    new GLTFLoader().load(
      modelUrl,
      gltf => {
        if (disposed) {
          gltf.scene.traverse(child => {
            child.geometry?.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.filter(Boolean).forEach(material => material.dispose());
          });
          return;
        }
        currentModel = gltf.scene;
        scene.add(currentModel);
        currentModel.traverse(child => {
          if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
            morphMeshes.push(child);
          }
          if (child.isMesh) {
            const name = (child.name || '').toLowerCase();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.filter(Boolean).forEach(mat => {
              // T-shirt / body clothing → black
              if (name.includes('body') || name.includes('cloth') || name.includes('shirt') || name.includes('top') || name.includes('outfit')) {
                mat.color = new THREE.Color(0x111111);
                mat.needsUpdate = true;
              }
              // Skin / face → slightly darker
              if (name.includes('face') || name.includes('skin') || name.includes('head')) {
                const c = mat.color || new THREE.Color(1, 1, 1);
                mat.color = new THREE.Color(c.r * 0.78, c.g * 0.72, c.b * 0.65);
                mat.needsUpdate = true;
              }
            });
          }
        });
        if (!morphMeshes.length) unavailableRef.current?.();

        // Rotate arms from T-pose to natural arms-down rest pose
        const armBoneMap = {
          leftUpper:  ['J_Bip_L_UpperArm', 'leftUpperArm', 'mixamorig:LeftArm', 'LeftArm', 'Left arm', 'Arm_L'],
          rightUpper: ['J_Bip_R_UpperArm', 'rightUpperArm', 'mixamorig:RightArm', 'RightArm', 'Right arm', 'Arm_R'],
          leftLower:  ['J_Bip_L_LowerArm', 'leftLowerArm', 'mixamorig:LeftForeArm', 'LeftForeArm', 'Left elbow', 'Elbow_L'],
          rightLower: ['J_Bip_R_LowerArm', 'rightLowerArm', 'mixamorig:RightForeArm', 'RightForeArm', 'Right elbow', 'Elbow_R'],
        };
        const findBone = (root, names) => {
          let found = null;
          root.traverse(node => { if (!found && node.isBone && names.includes(node.name)) found = node; });
          return found;
        };
        const deg = Math.PI / 180;
        const leftUpper = findBone(currentModel, armBoneMap.leftUpper);
        const rightUpper = findBone(currentModel, armBoneMap.rightUpper);
        const leftLower = findBone(currentModel, armBoneMap.leftLower);
        const rightLower = findBone(currentModel, armBoneMap.rightLower);
        if (leftUpper)  leftUpper.rotation.z += 70 * deg;
        if (rightUpper) rightUpper.rotation.z -= 70 * deg;
        if (leftLower)  leftLower.rotation.z += 5 * deg;
        if (rightLower) rightLower.rotation.z -= 5 * deg;

        applyTexture(currentModel);
      },
      undefined,
      () => unavailableRef.current?.()
    );

    const animate = () => {
      if (document.hidden) {
        frameId = undefined;
        return;
      }
      frameId = requestAnimationFrame(animate);
      timer.update();
      const delta = timer.getDelta();
      const elapsed = timer.getElapsed();

      if (currentModel && !reducedMotion) {
        currentModel.position.y = Math.sin(elapsed * 1.4) * 0.006;
        currentModel.rotation.y = Math.sin(elapsed * 0.35) * 0.025;
      }

      blinkStartedAt += delta;
      let blinkWeight = 0;
      if (!reducedMotion && blinkStartedAt > nextBlinkAt) {
        const progress = (blinkStartedAt - nextBlinkAt) / 0.16;
        if (progress <= 1) blinkWeight = Math.sin(progress * Math.PI);
        else {
          blinkStartedAt = 0;
          nextBlinkAt = 2.4 + Math.random() * 2.8;
        }
      }

      const targets = targetWeightsRef?.current || fallbackWeightsRef.current || {};
      for (const mesh of morphMeshes) {
        for (const name of Object.keys(MORPH_ALIASES)) {
          const index = resolveMorphIndex(mesh.morphTargetDictionary, name);
          if (!Number.isInteger(index)) continue;
          let target = targets[name] || 0;
          if (reducedMotion && !name.startsWith('eyeBlink')) target *= 0.65;
          if (name === 'eyeBlinkLeft' || name === 'eyeBlinkRight') target = Math.max(target, blinkWeight);
          mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[index] || 0,
            target,
            0.3
          );
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const nextWidth = container.clientWidth || 400;
      const nextHeight = container.clientHeight || 500;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    const resume = () => {
      if (!document.hidden && !frameId) {
        timer.update();
        animate();
      }
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resume);

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      timer.dispose();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', resume);
      customTexture?.dispose();
      currentModel?.traverse(child => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.filter(Boolean).forEach(material => {
          for (const value of Object.values(material)) {
            if (value?.isTexture && value !== customTexture) value.dispose();
          }
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelUrl, reducedMotion, targetWeightsRef, textureUrl]);

  return <div ref={containerRef} className={`avatar-stage ${className}`.trim()} aria-hidden="true" />;
}
