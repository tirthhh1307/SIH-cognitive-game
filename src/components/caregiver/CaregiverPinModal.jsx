import React, { useState } from 'react';
import { Lock, KeyRound, X, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { verifyCaregiverPin, changeCaregiverPin } from '../../utils/platform';
import { playClickSound, playSuccessSound } from '../../utils/audio';

export function CaregiverPinModal({ state, onStateChange, onUnlocked, onClose }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleDigit = (digit) => {
    playClickSound();
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Auto-verify on 4th digit
        if (verifyCaregiverPin(state, nextPin)) {
          playSuccessSound();
          onUnlocked();
        } else {
          setErrorMsg('Incorrect 4-digit Caregiver PIN. Try default (1234).');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleClear = () => {
    playClickSound();
    setPin('');
    setErrorMsg('');
  };

  const handleDelete = () => {
    playClickSound();
    setPin(p => p.slice(0, -1));
    setErrorMsg('');
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    const res = changeCaregiverPin(state, currentPinInput, newPinInput);
    if (!res.success) {
      setErrorMsg(res.reason || 'Failed to update PIN');
      return;
    }
    playSuccessSound();
    onStateChange(res.state);
    setChangeSuccess(true);
    setTimeout(() => {
      setIsChangingPin(false);
      setChangeSuccess(false);
      setCurrentPinInput('');
      setNewPinInput('');
      onUnlocked();
    }, 1200);
  };

  return (
    <div className="caregiver-pin-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="caregiver-pin-card" onClick={e => e.stopPropagation()}>
        <button className="pin-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {!isChangingPin ? (
          <>
            <div className="pin-header-center">
              <div className="pin-lock-icon">
                <Lock size={32} />
              </div>
              <h2 className="pin-title">Caregiver & ASHA Lock</h2>
              <p className="pin-subtitle">
                Enter your 4-digit clinical PIN to access patient analytics, reminders, and clinical exports.
              </p>
            </div>

            {/* PIN Dots Indicator */}
            <div className={`pin-dots-display ${errorMsg ? 'shake-dots' : ''}`}>
              {[0, 1, 2, 3].map(index => (
                <div
                  key={index}
                  className={`pin-dot ${index < pin.length ? 'filled-dot' : ''}`}
                ></div>
              ))}
            </div>

            {errorMsg && (
              <div className="pin-error-alert" role="alert">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="pin-keypad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => {
                if (key === 'C') {
                  return (
                    <button key={key} type="button" className="pin-key-btn key-clear" onClick={handleClear}>
                      C
                    </button>
                  );
                }
                if (key === '⌫') {
                  return (
                    <button key={key} type="button" className="pin-key-btn key-back" onClick={handleDelete}>
                      ⌫
                    </button>
                  );
                }
                return (
                  <button key={key} type="button" className="pin-key-btn" onClick={() => handleDigit(key)}>
                    {key}
                  </button>
                );
              })}
            </div>

            <div className="pin-footer-actions">
              <span className="pin-default-hint">Default ASHA PIN: <strong>1234</strong></span>
              <button
                type="button"
                className="btn-change-pin-link"
                onClick={() => {
                  playClickSound();
                  setIsChangingPin(true);
                  setErrorMsg('');
                }}
              >
                <KeyRound size={14} />
                <span>Change PIN</span>
              </button>
            </div>
          </>
        ) : (
          <form className="change-pin-form" onSubmit={handleChangePinSubmit}>
            <div className="pin-header-center">
              <div className="pin-lock-icon">
                <KeyRound size={32} />
              </div>
              <h2 className="pin-title">Change Caregiver PIN</h2>
              <p className="pin-subtitle">Update your 4-digit security code.</p>
            </div>

            {changeSuccess ? (
              <div className="pin-success-banner">
                <ShieldCheck size={24} />
                <span>PIN updated successfully! Unlocking...</span>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="pin-error-alert" role="alert">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-input-group">
                  <label>Current 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    required
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value)}
                    placeholder="e.g. 1234"
                  />
                </div>

                <div className="form-input-group">
                  <label>New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    required
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    placeholder="e.g. 5678"
                  />
                </div>

                <div className="change-pin-btn-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsChangingPin(false);
                      setErrorMsg('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save New PIN
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
