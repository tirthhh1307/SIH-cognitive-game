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
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.filter(Boolean).forEach(mat => {
              const matName = mat.name || '';

              // Black T-Shirt
              if (matName.includes('Tops') || matName.includes('CLOTH') && !matName.includes('Bottoms') && !matName.includes('Shoes')) {
                mat.color = new THREE.Color(0x181818);
                mat.needsUpdate = true;
              }
              // Tan Skin for Body and Face
              else if (matName.includes('SKIN') || matName.includes('Body') || matName.includes('Face_00')) {
                // Tint texture to warm tan skin tone
                mat.color = new THREE.Color(0.86, 0.72, 0.62);
                mat.needsUpdate = true;
              }
            });
          }
        });
        if (!morphMeshes.length) unavailableRef.current?.();

        // Rotate arms & sleeves down from T-pose to natural resting pose
        const deg = Math.PI / 180;
        const findNode = name => {
          let target = null;
          currentModel.traverse(node => {
            if (!target && node.name === name) target = node;
          });
          return target;
        };

        // Left arm & sleeve (Z negative rotates down)
        const leftUpper = findNode('J_Bip_L_UpperArm');
        const leftSleeve = findNode('J_Aim_L_TopsUpperArm');
        const leftLower = findNode('J_Bip_L_LowerArm');
        if (leftUpper) {
          leftUpper.rotation.z -= 70 * deg;
          leftUpper.rotation.y += 10 * deg;
          leftUpper.rotation.x += 5 * deg;
        }
        if (leftSleeve) {
          leftSleeve.rotation.z -= 70 * deg;
          leftSleeve.rotation.y += 10 * deg;
        }
        if (leftLower) {
          leftLower.rotation.z -= 10 * deg;
          leftLower.rotation.y += 15 * deg;
        }

        // Right arm & sleeve (Z positive rotates down)
        const rightUpper = findNode('J_Bip_R_UpperArm');
        const rightSleeve = findNode('J_Aim_R_TopsUpperArm');
        const rightLower = findNode('J_Bip_R_LowerArm');
        if (rightUpper) {
          rightUpper.rotation.z += 70 * deg;
          rightUpper.rotation.y -= 10 * deg;
          rightUpper.rotation.x += 5 * deg;
        }
        if (rightSleeve) {
          rightSleeve.rotation.z += 70 * deg;
          rightSleeve.rotation.y -= 10 * deg;
        }
        if (rightLower) {
          rightLower.rotation.z += 10 * deg;
          rightLower.rotation.y -= 15 * deg;
        }

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
