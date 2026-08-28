export const RHUBARB_MORPH_MAP = {
  X: { jawOpen: 0.0, mouthPucker: 0.0, mouthSmile: 0.0, mouthFunnel: 0.0, mouthClose: 0.0 },
  A: { jawOpen: 0.05, mouthPucker: 0.1, mouthSmile: 0.0, mouthFunnel: 0.0, mouthClose: 0.9 },
  B: { jawOpen: 0.25, mouthPucker: 0.0, mouthSmile: 0.6, mouthFunnel: 0.0, mouthClose: 0.0 },
  C: { jawOpen: 0.45, mouthPucker: 0.0, mouthSmile: 0.3, mouthFunnel: 0.2, mouthClose: 0.0 },
  D: { jawOpen: 0.85, mouthPucker: 0.0, mouthSmile: 0.1, mouthFunnel: 0.1, mouthClose: 0.0 },
  E: { jawOpen: 0.50, mouthPucker: 0.3, mouthSmile: 0.0, mouthFunnel: 0.7, mouthClose: 0.0 },
  F: { jawOpen: 0.30, mouthPucker: 0.8, mouthSmile: 0.0, mouthFunnel: 0.5, mouthClose: 0.0 },
  G: { jawOpen: 0.15, mouthPucker: 0.2, mouthSmile: 0.1, mouthFunnel: 0.0, mouthClose: 0.4 },
  H: { jawOpen: 0.35, mouthPucker: 0.0, mouthSmile: 0.4, mouthFunnel: 0.0, mouthClose: 0.0 }
};

export const MORPH_ALIASES = {
  jawOpen: ['jawOpen', 'Face_Blendshape.Fcl_MTH_A', 'Face_Blendshape.Fcl_MTH_Large'],
  mouthPucker: ['mouthPucker', 'Face_Blendshape.Fcl_MTH_U'],
  mouthFunnel: ['mouthFunnel', 'Face_Blendshape.Fcl_MTH_O'],
  mouthSmile: ['mouthSmile', 'Face_Blendshape.Fcl_MTH_Joy'],
  mouthClose: ['mouthClose', 'Face_Blendshape.Fcl_MTH_Close'],
  eyeBlinkLeft: ['eyeBlinkLeft', 'Face_Blendshape.Fcl_EYE_Close_L'],
  eyeBlinkRight: ['eyeBlinkRight', 'Face_Blendshape.Fcl_EYE_Close_R']
};

export function resolveMorphIndex(dictionary, name) {
  return MORPH_ALIASES[name]?.map(alias => dictionary[alias]).find(Number.isInteger);
}

export function getBlendshapeWeights(visemes, currentTime, transitionWindow = 0.06) {
  if (!Array.isArray(visemes) || visemes.length === 0) {
    return { ...RHUBARB_MORPH_MAP.X };
  }

  const activeIdx = visemes.findIndex(v => currentTime >= v.start && currentTime <= v.end);
  if (activeIdx === -1) {
    return { ...RHUBARB_MORPH_MAP.X };
  }

  const current = visemes[activeIdx];
  const targetMap = RHUBARB_MORPH_MAP[current.value] || RHUBARB_MORPH_MAP.X;

  const timeIntoViseme = currentTime - current.start;
  const timeRemaining = current.end - currentTime;

  let progress = 1.0;
  if (timeIntoViseme < transitionWindow && activeIdx > 0) {
    progress = timeIntoViseme / transitionWindow;
  } else if (timeRemaining < transitionWindow && activeIdx < visemes.length - 1) {
    progress = timeRemaining / transitionWindow;
  }

  const result = {};
  for (const [key, val] of Object.entries(targetMap)) {
    result[key] = Math.max(0, Math.min(1, val * progress));
  }
  return result;
}
