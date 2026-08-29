import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  createPatient,
  switchActivePatient,
  updateActivePatient,
  deletePatient,
  getActivePatient,
  verifyCaregiverPin,
  changeCaregiverPin
} from '../src/utils/platform.js';

test('initial state contains 2 demo ASHA patients and default PIN', () => {
  const state = createInitialState();
  assert.equal(state.patients.length, 2);
  assert.equal(state.activePatientId, 'patient-1');
  assert.equal(state.caregiverPin, '1234');

  const active = getActivePatient(state);
  assert.equal(active.name, 'Biren Das');
  assert.equal(active.state, 'Assam');
});

test('createPatient appends new village elder and switches active', () => {
  let state = createInitialState();
  state = createPatient(state, {
    name: 'Tenzing Lepcha',
    age: 76,
    village: 'Ravangla',
    district: 'South Sikkim',
    state: 'Sikkim',
    stage: 'moderate',
    language: 'en'
  });

  assert.equal(state.patients.length, 3);
  const active = getActivePatient(state);
  assert.equal(active.name, 'Tenzing Lepcha');
  assert.equal(active.state, 'Sikkim');
  assert.equal(state.profile.name, 'Tenzing Lepcha');
});

test('switchActivePatient switches active profile and attributes', () => {
  let state = createInitialState();
  assert.equal(state.activePatientId, 'patient-1');

  state = switchActivePatient(state, 'patient-2');
  assert.equal(state.activePatientId, 'patient-2');
  assert.equal(state.profile.name, 'Memi Devi / Chanu');
  assert.equal(state.profile.stage, 'early');
});

test('updateActivePatient updates fields of current active patient', () => {
  let state = createInitialState();
  state = updateActivePatient(state, { notes: 'Attended ASHA mobile cognitive clinic' });
  const active = getActivePatient(state);
  assert.equal(active.notes, 'Attended ASHA mobile cognitive clinic');
});

test('verifyCaregiverPin checks exact PIN match', () => {
  const state = createInitialState();
  assert.equal(verifyCaregiverPin(state, '1234'), true);
  assert.equal(verifyCaregiverPin(state, '0000'), false);
  assert.equal(verifyCaregiverPin(state, '123'), false);
});

test('changeCaregiverPin updates PIN when current PIN is verified and new PIN is 4 digits', () => {
  let state = createInitialState();
  const invalidAttempt = changeCaregiverPin(state, 'wrong', '5678');
  assert.equal(invalidAttempt.success, false);

  const nonDigitAttempt = changeCaregiverPin(state, '1234', '56a8');
  assert.equal(nonDigitAttempt.success, false);

  const validChange = changeCaregiverPin(state, '1234', '9876');
  assert.equal(validChange.success, true);
  assert.equal(validChange.state.caregiverPin, '9876');
  assert.equal(verifyCaregiverPin(validChange.state, '9876'), true);
});
