import test from 'node:test';
import assert from 'node:assert/strict';
import { getBlendshapeWeights, resolveMorphIndex, RHUBARB_MORPH_MAP } from '../src/utils/avatar/visemeMapper.js';

test('visemeMapper returns neutral face for silent time range', () => {
  const visemes = [{ start: 1.0, end: 2.0, value: 'D' }];
  const weights = getBlendshapeWeights(visemes, 0.5);
  assert.equal(weights.jawOpen, 0);
  assert.equal(weights.mouthPucker, 0);
});

test('visemeMapper computes correct weights for active viseme D (AA sound)', () => {
  const visemes = [{ start: 1.0, end: 2.0, value: 'D' }];
  const weights = getBlendshapeWeights(visemes, 1.5);
  assert.ok(weights.jawOpen >= 0.7);
});

test('visemeMapper interpolates smoothly during transitions', () => {
  const visemes = [
    { start: 0.0, end: 1.0, value: 'X' },
    { start: 1.0, end: 2.0, value: 'D' }
  ];
  const weights = getBlendshapeWeights(visemes, 1.02);
  assert.ok(weights.jawOpen > 0);
});

test('semantic mouth targets resolve against the licensed VRM names', () => {
  const dictionary = {
    'Face_Blendshape.Fcl_MTH_A': 1,
    'Face_Blendshape.Fcl_MTH_U': 2,
    'Face_Blendshape.Fcl_EYE_Close_L': 3
  };
  assert.equal(resolveMorphIndex(dictionary, 'jawOpen'), 1);
  assert.equal(resolveMorphIndex(dictionary, 'mouthPucker'), 2);
  assert.equal(resolveMorphIndex(dictionary, 'eyeBlinkLeft'), 3);
});
