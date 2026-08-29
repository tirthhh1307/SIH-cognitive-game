import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  plantSeedInPot,
  waterGardenPot,
  fertilizeGardenPot,
  careGardenPotWithSpecial,
  collectGardenStars,
  buyGardenMarketItem,
  toggleGardenBgm
} from '../src/utils/platform.js';

test('initial state contains tiered garden pots and valid inventory', () => {
  const state = createInitialState();
  assert.equal(state.garden.pots.length, 16);
  assert.equal(state.garden.bgmEnabled, true);
  assert.equal(typeof state.garden.inventory.seeds, 'object');
  assert.ok(state.garden.inventory.fertilizer >= 1);
});

test('planting a seed in an empty pot consumes seed and updates pot', () => {
  let state = createInitialState();
  const potId = 7; // empty stand
  const plantId = 'lotus';
  const initialSeeds = state.garden.inventory.seeds[plantId] || 0;

  state = plantSeedInPot(state, potId, plantId);
  const pot = state.garden.pots.find(p => p.id === potId);

  assert.equal(pot.plantId, plantId);
  assert.equal(pot.stage, 0);
  assert.equal(state.garden.inventory.seeds[plantId], initialSeeds - 1);
});

test('watering a plant advances growth stage and adds stars in bloom', () => {
  let state = createInitialState();
  const potId = 1; // Orchid at stage 3
  const initialStage = state.garden.pots.find(p => p.id === potId).stage;

  state = waterGardenPot(state, potId, 8);
  const pot = state.garden.pots.find(p => p.id === potId);

  assert.equal(pot.stage, Math.min(4, initialStage + 1));
  assert.ok(pot.starsToCollect > 0);
});

test('fertilizing a plant advances growth and consumes fertilizer', () => {
  let state = createInitialState();
  const potId = 2; // Tea at stage 2
  const initialFert = state.garden.inventory.fertilizer;

  state = fertilizeGardenPot(state, potId, 10);
  const pot = state.garden.pots.find(p => p.id === potId);

  assert.equal(pot.stage, 3);
  assert.equal(state.garden.inventory.fertilizer, initialFert - 1);
  assert.ok(pot.starsToCollect >= 10);
});

test('collecting stars empties pot star bubble and adds to wallet', () => {
  let state = createInitialState();
  const potId = 1;
  const initialStars = state.stars;
  const potStars = state.garden.pots.find(p => p.id === potId).starsToCollect;

  state = collectGardenStars(state, potId);
  const pot = state.garden.pots.find(p => p.id === potId);

  assert.equal(pot.starsToCollect, 0);
  assert.equal(state.stars, initialStars + potStars);
});

test('buying seed in Zen Market deducts stars and adds seed to inventory', () => {
  let state = { ...createInitialState(), stars: 100 };
  const item = { seedPlantId: 'brahma_kamal', price: 50 };
  const initialSeedCount = state.garden.inventory.seeds.brahma_kamal || 0;

  const result = buyGardenMarketItem(state, item);
  assert.equal(result.success, true);
  assert.equal(result.state.stars, 50);
  assert.equal(result.state.garden.inventory.seeds.brahma_kamal, initialSeedCount + 1);
});

test('cannot buy item if star balance is insufficient', () => {
  let state = { ...createInitialState(), stars: 10 };
  const item = { seedPlantId: 'brahma_kamal', price: 50 };

  const result = buyGardenMarketItem(state, item);
  assert.equal(result.success, false);
  assert.equal(result.state.stars, 10);
});

test('toggleGardenBgm flips bgmEnabled boolean', () => {
  let state = createInitialState();
  assert.equal(state.garden.bgmEnabled, true);

  state = toggleGardenBgm(state);
  assert.equal(state.garden.bgmEnabled, false);

  state = toggleGardenBgm(state);
  assert.equal(state.garden.bgmEnabled, true);
});
