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

    function createAssamiFaceTexture(baseTexture) {
      if (!baseTexture?.image) return baseTexture;
      try {
        const canvas = document.createElement('canvas');
        const img = baseTexture.image;
        canvas.width = img.width || 1024;
        canvas.height = img.height || 1024;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        // 1. Traditional Assamese red bindi (Phut) on the forehead
        const bx = w * 0.5;
        const by = h * 0.487;
        const bRadius = w * 0.011;

        ctx.beginPath();
        ctx.arc(bx, by, bRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#b71c1c';
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#6d0707';
        ctx.stroke();

        // 2. Clear, delicate nose definition
        const nx = w * 0.5;
        const ny = h * 0.662;

        // Subtle soft shadow notch
        ctx.beginPath();
        ctx.ellipse(nx + w * 0.001, ny, w * 0.0035, h * 0.006, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(105, 48, 25, 0.65)';
        ctx.fill();

        // Delicate warm contour stroke
        ctx.beginPath();
        ctx.moveTo(nx, ny - h * 0.005);
        ctx.lineTo(nx, ny + h * 0.004);
        ctx.strokeStyle = 'rgba(75, 32, 16, 0.85)';
        ctx.lineWidth = Math.max(2, w * 0.0025);
        ctx.lineCap = 'round';
        ctx.stroke();

        // 3. Clear, natural warm rose lip definition
        const mx = w * 0.5;
        const my = h * 0.755;
        const lipHalfW = w * 0.038;

        // Soft natural rose lip tint (upper + lower)
        ctx.beginPath();
        ctx.ellipse(mx, my, lipHalfW * 0.95, h * 0.012, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(185, 75, 80, 0.55)';
        ctx.fill();

        // Clean, defined lip parting smile line
        ctx.beginPath();
        ctx.moveTo(mx - lipHalfW, my);
        ctx.quadraticCurveTo(mx - lipHalfW * 0.5, my + h * 0.0025, mx, my + h * 0.001);
        ctx.quadraticCurveTo(mx + lipHalfW * 0.5, my + h * 0.0025, mx + lipHalfW, my);
        ctx.strokeStyle = '#6e2327';
        ctx.lineWidth = Math.max(2.5, w * 0.003);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Subtle bottom lip soft shadow
        ctx.beginPath();
        ctx.ellipse(mx, my + h * 0.012, lipHalfW * 0.45, h * 0.0035, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(95, 42, 25, 0.5)';
        ctx.fill();

        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.flipY = false;
        canvasTexture.colorSpace = THREE.SRGBColorSpace;
        return canvasTexture;
      } catch {
        return baseTexture;
      }
    }

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
            if (material.name?.includes('SKIN') || material.name?.includes('Face_00')) {
              material.map = texture;
              material.needsUpdate = true;
            }
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

              // Yellow / Ochre T-Shirt (traditional warm golden ochre)
              if (matName.includes('Tops') || (matName.includes('CLOTH') && !matName.includes('Bottoms') && !matName.includes('Shoes'))) {
                mat.color = new THREE.Color(0xd99e28);
                mat.needsUpdate = true;
              }
              // Assamese rich warm golden-tan skin tone for body and face
              else if (matName.includes('SKIN') || matName.includes('Body') || matName.includes('Face_00')) {
                mat.color = new THREE.Color(0.70, 0.48, 0.35);
                if (matName.includes('Face_00') && !textureUrl && mat.map) {
                  const assamiMap = createAssamiFaceTexture(mat.map);
                  mat.map = assamiMap;
                }
                mat.needsUpdate = true;
              }
              // Natural lustrous black hair with subtle warm sheen
              else if (matName.includes('HAIR') || matName.includes('Hair')) {
                mat.color = new THREE.Color(0.12, 0.10, 0.09);
                mat.needsUpdate = true;
              }
              // Deep warm dark eyes
              else if (matName.includes('EyeIris')) {
                mat.color = new THREE.Color(0.20, 0.13, 0.08);
                mat.needsUpdate = true;
              }
              // Dark defined brows and eyeline
              else if (matName.includes('FaceBrow') || matName.includes('FaceEyeline')) {
                mat.color = new THREE.Color(0.10, 0.08, 0.08);
                mat.needsUpdate = true;
              }
              // Healthy natural mouth interior
              else if (matName.includes('FaceMouth')) {
                mat.color = new THREE.Color('#d46267');
                mat.needsUpdate = true;
              }
            });
          }
        });
        if (!morphMeshes.length) unavailableRef.current?.();

        // Rotate arms & sleeves down cleanly from T-pose to natural resting pose
        const deg = Math.PI / 180;
        const findNode = name => {
          let target = null;
          currentModel.traverse(node => {
            if (!target && node.name === name) target = node;
          });
          return target;
        };

        // Left shoulder, arm, sleeve & aim bones (Z negative rotates down)
        const leftShoulder = findNode('J_Bip_L_Shoulder');
        const leftUpper = findNode('J_Bip_L_UpperArm');
        const leftSleeve = findNode('J_Aim_L_TopsUpperArm');
        const leftAimShoulder = findNode('J_Aim_L_Shoulder');
        const leftRollArm = findNode('J_Roll_L_UpperArm');
        const leftLower = findNode('J_Bip_L_LowerArm');

        if (leftShoulder) {
          leftShoulder.rotation.z -= 4 * deg;
        }

        const lUpperRotZ = -62 * deg;
        const lUpperRotY = 10 * deg;
        const lUpperRotX = 4 * deg;

        [leftUpper, leftSleeve, leftAimShoulder].forEach(node => {
          if (node) {
            node.rotation.z += lUpperRotZ;
            node.rotation.y += lUpperRotY;
            node.rotation.x += lUpperRotX;
          }
        });
        if (leftRollArm) {
          leftRollArm.rotation.set(0, 0, 0);
        }
        if (leftLower) {
          leftLower.rotation.z -= 10 * deg;
          leftLower.rotation.y += 12 * deg;
        }

        // Right shoulder, arm, sleeve & aim bones (Z positive rotates down)
        const rightShoulder = findNode('J_Bip_R_Shoulder');
        const rightUpper = findNode('J_Bip_R_UpperArm');
        const rightSleeve = findNode('J_Aim_R_TopsUpperArm');
        const rightAimShoulder = findNode('J_Aim_R_Shoulder');
        const rightRollArm = findNode('J_Roll_R_UpperArm');
        const rightLower = findNode('J_Bip_R_LowerArm');

        if (rightShoulder) {
          rightShoulder.rotation.z += 4 * deg;
        }

        const rUpperRotZ = 62 * deg;
        const rUpperRotY = -10 * deg;
        const rUpperRotX = 4 * deg;

        [rightUpper, rightSleeve, rightAimShoulder].forEach(node => {
          if (node) {
            node.rotation.z += rUpperRotZ;
            node.rotation.y += rUpperRotY;
            node.rotation.x += rUpperRotX;
          }
        });
        if (rightRollArm) {
          rightRollArm.rotation.set(0, 0, 0);
        }
        if (rightLower) {
          rightLower.rotation.z += 10 * deg;
          rightLower.rotation.y -= 12 * deg;
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
