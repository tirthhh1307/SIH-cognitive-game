import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Check,
  X,
  MapPin,
  Calendar,
  FileText,
  Download,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import {
  createPatient,
  switchActivePatient,
  deletePatient,
  getActivePatient
} from '../../utils/platform';
import { playClickSound, playSuccessSound } from '../../utils/audio';

const NER_STATES = [
  'Assam',
  'Manipur',
  'Meghalaya',
  'Nagaland',
  'Mizoram',
  'Tripura',
  'Arunachal Pradesh',
  'Sikkim'
];

export function AshaPatientSwitcher({ state, onStateChange, onClose }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '70',
    gender: 'Female',
    village: '',
    district: '',
    state: 'Assam',
    stage: 'mild',
    language: 'as',
    emergencyName: '',
    emergencyPhone: '',
    notes: ''
  });

  const patients = state.patients || [];
  const activePatientId = state.activePatientId;
  const activePatient = getActivePatient(state);

  const handleSelectPatient = (patientId) => {
    playClickSound();
    const nextState = switchActivePatient(state, patientId);
    onStateChange(nextState);
    playSuccessSound();
    onClose();
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    playSuccessSound();
    const nextState = createPatient(state, formData);
    onStateChange(nextState);
    setShowAddForm(false);
    onClose();
  };

  const handleExportRoster = () => {
    playClickSound();
    const summary = {
      exportType: 'ASHA_COMMUNITY_HEALTH_ROSTER',
      exportedAt: new Date().toISOString(),
      healthWorkerRole: 'ASHA / Anganwadi Community Neurological Screening',
      totalPatients: patients.length,
      activePatientId: activePatientId,
      patientRoster: patients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        location: `${p.village || 'Village'}, ${p.district || 'District'}, ${p.state || 'Assam'}`,
        cognitiveStage: p.stage,
        emergencyContact: `${p.emergencyName || 'N/A'} (${p.emergencyPhone || 'N/A'})`,
        notes: p.notes,
        totalGameAttempts: (state.attempts || []).filter(a => a.patientId === p.id).length
      }))
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asha-village-roster-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStageBadgeColor = (stage) => {
    if (stage === 'mild' || stage === 'early') return 'stage-pill-green';
    if (stage === 'moderate') return 'stage-pill-amber';
    return 'stage-pill-purple';
  };

  return (
    <div className="asha-switcher-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="asha-switcher-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="asha-modal-header">
          <div className="modal-header-left">
            <div className="asha-badge-icon">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h2 className="asha-modal-title">ASHA Village Patient Roster</h2>
              <p className="asha-modal-subtitle">
                Support multiple community elders on this shared offline device
              </p>
            </div>
          </div>
          <button className="pin-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="asha-toolbar-row">
          <button
            type="button"
            className={`btn-toolbar-toggle ${!showAddForm ? 'active-toolbar' : ''}`}
            onClick={() => setShowAddForm(false)}
          >
            <Users size={16} />
            <span>Village Elders ({patients.length})</span>
          </button>

          <button
            type="button"
            className={`btn-toolbar-toggle ${showAddForm ? 'active-toolbar' : ''}`}
            onClick={() => setShowAddForm(true)}
          >
            <UserPlus size={16} />
            <span>Register New Elder</span>
          </button>

          <button
            type="button"
            className="btn-export-roster"
            onClick={handleExportRoster}
            title="Download JSON summary for Primary Health Centre (PHC)"
          >
            <Download size={15} />
            <span>Export PHC Report</span>
          </button>
        </div>

        {/* Content Body */}
        {!showAddForm ? (
          <div className="patients-roster-list">
            {patients.map((patient) => {
              const isActive = patient.id === activePatientId;
              return (
                <div
                  key={patient.id}
                  className={`patient-roster-card ${isActive ? 'active-roster-card' : ''}`}
                  onClick={() => handleSelectPatient(patient.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="patient-avatar-circle">
                    <span>{patient.gender === 'Female' ? '👵' : '👴'}</span>
                    {isActive && <span className="active-dot-badge">✓</span>}
                  </div>

                  <div className="patient-main-info">
                    <div className="patient-name-row">
                      <h3 className="patient-card-name">{patient.name}</h3>
                      <span className="patient-age-tag">{patient.age} yrs</span>
                      <span className={`patient-stage-badge ${getStageBadgeColor(patient.stage)}`}>
                        {patient.stage.toUpperCase()}
                      </span>
                    </div>

                    <div className="patient-location-line">
                      <MapPin size={13} />
                      <span>{patient.village}, {patient.district} ({patient.state})</span>
                    </div>

                    {patient.notes && (
                      <p className="patient-notes-snippet">“{patient.notes}”</p>
                    )}
                  </div>

                  <div className="patient-card-action">
                    {isActive ? (
                      <span className="current-active-tag">
                        <Check size={14} /> Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-switch-patient"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPatient(patient.id);
                        }}
                      >
                        Switch To
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <form className="register-patient-form" onSubmit={handleAddSubmit}>
            <div className="form-grid-2col">
              <div className="form-input-group">
                <label>Elder Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Radhika Sharma / Borah"
                />
              </div>

              <div className="form-input-group">
                <label>Age *</label>
                <input
                  type="number"
                  min="40"
                  max="115"
                  required
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="form-input-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-input-group">
                <label>North Eastern State *</label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                >
                  {NER_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-input-group">
                <label>Village / Gram Panchayat *</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  placeholder="e.g. Kamalabari"
                />
              </div>

              <div className="form-input-group">
                <label>District *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Majuli / Bishnupur"
                />
              </div>

              <div className="form-input-group">
                <label>Initial Cognitive Assessment Stage</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value })}
                >
                  <option value="early">Early / Mild Forgetfulness</option>
                  <option value="mild">Mild Cognitive Decline</option>
                  <option value="moderate">Moderate Assistance Needed</option>
                  <option value="severe">Severe / Sensory Only</option>
                </select>
              </div>

              <div className="form-input-group">
                <label>Preferred Language</label>
                <select
                  value={formData.language}
                  onChange={e => setFormData({ ...formData, language: e.target.value })}
                >
                  <option value="as">অসমীয়া (Assamese)</option>
                  <option value="en">English</option>
                  <option value="mni">মৈতৈলোন্ (Manipuri)</option>
                  <option value="trp">ককবরক (Tripuri)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div className="form-input-group">
                <label>Family / Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="e.g. Ramen (Son)"
                />
              </div>

              <div className="form-input-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="e.g. 9864012345"
                />
              </div>
            </div>

            <div className="form-input-group full-width">
              <label>ASHA Health Worker Notes & Observations</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes on visual recognition, language clarity, daily orientation..."
              ></textarea>
            </div>

            <div className="form-action-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save & Set Active Elder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
