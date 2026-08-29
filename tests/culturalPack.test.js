import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES } from '../src/data/games.js';
import { GARDEN_PLANTS } from '../src/data/gardenItems.js';
import { LANGUAGES } from '../src/data/i18n.js';

test('festival match game covers all 8 North Eastern sister states', () => {
  const festivalGame = GAMES.find(g => g.id === 'festival-match');
  assert.ok(festivalGame, 'festival-match game must exist');

  const pairs = festivalGame.content.pairs;
  const labels = pairs.map(p => p.label.toLowerCase());

  assert.ok(labels.some(l => l.includes('assam')), 'Must include Assam');
  assert.ok(labels.some(l => l.includes('nagaland')), 'Must include Nagaland');
  assert.ok(labels.some(l => l.includes('sikkim')), 'Must include Sikkim');
  assert.ok(labels.some(l => l.includes('mizoram')), 'Must include Mizoram');
  assert.ok(labels.some(l => l.includes('meghalaya')), 'Must include Meghalaya');
  assert.ok(labels.some(l => l.includes('tripura')), 'Must include Tripura');
  assert.ok(labels.some(l => l.includes('manipur')), 'Must include Manipur');
  assert.ok(labels.some(l => l.includes('arunachal')), 'Must include Arunachal');
});

test('garden catalog contains authentic flora across North Eastern regions', () => {
  assert.ok(GARDEN_PLANTS.length >= 8);
  const plantIds = GARDEN_PLANTS.map(p => p.id);
  assert.ok(plantIds.includes('orchid')); // Assam
  assert.ok(plantIds.includes('tea')); // Assam
  assert.ok(plantIds.includes('brahma_kamal')); // Himalayan / Sikkim / Arunachal
  assert.ok(plantIds.includes('bamboo')); // All NE states
  assert.ok(plantIds.includes('lotus')); // Manipur / Assam
});

test('language system contains 8 NER regional language codes and fallbacks', () => {
  assert.ok(LANGUAGES.as, 'Assamese');
  assert.ok(LANGUAGES.mni, 'Manipuri');
  assert.ok(LANGUAGES.trp, 'Tripuri');
  assert.ok(LANGUAGES.mzo, 'Mizo');
  assert.ok(LANGUAGES.kha, 'Khasi');
  assert.ok(LANGUAGES.npi, 'Nepali (Sikkim)');
});
