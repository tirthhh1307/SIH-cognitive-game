import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Check, HeartPulse, Phone, Plus, Trash2 } from 'lucide-react';
import { addCheckIn, getDueReminders, removeReminder, upsertReminder } from '../utils/platform';

const MOODS = [
  { id: 'great', label: 'Great', symbol: '😊' },
  { id: 'calm', label: 'Calm', symbol: '🙂' },
  { id: 'tired', label: 'Tired', symbol: '😴' },
  { id: 'worried', label: 'Worried', symbol: '😟' },
  { id: 'sad', label: 'Sad', symbol: '😔' }
];

const localDate = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

export function DailyCheckIn({ state, onStateChange }) {
  const today = localDate(new Date());
  const saved = state.checkIns.find(entry => entry.date === today);
  const [form, setForm] = useState(saved ?? { medicine: false, meals: false, walk: false, mood: 'calm', recentEvent: '' });
  const [savedMessage, setSavedMessage] = useState('');
  const [reminderForm, setReminderForm] = useState({ label: '', time: '09:00' });
  const [now, setNow] = useState(new Date());
  const [notificationMessage, setNotificationMessage] = useState('');
  const due = useMemo(() => getDueReminders(state, now), [state, now]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!due.length) return;
    const reminder = due[0];
    setNotificationMessage(`Reminder: ${reminder.label}`);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Apon Mon reminder', { body: reminder.label });
    }
    onStateChange(previous => upsertReminder(previous, { ...reminder, lastShownDate: localDate(now) }));
  }, [due.map(({ id }) => id).join(','), now.getMinutes()]);

  const saveCheckIn = event => {
    event.preventDefault();
    onStateChange(previous => addCheckIn(previous, {
      ...form,
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      date: today
    }));
    setSavedMessage('Today’s check-in is safely saved on this device.');
  };

  const addReminder = event => {
    event.preventDefault();
    onStateChange(previous => upsertReminder(previous, {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      ...reminderForm,
      enabled: true
    }));
    setReminderForm({ label: '', time: '09:00' });
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationMessage('This browser does not support notifications. In-app reminders still work.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationMessage(permission === 'granted'
      ? 'Notifications enabled while your device permits them.'
      : 'Notifications are off. In-app reminders still work.');
  };

  const updateProfile = patch => onStateChange(previous => ({
    ...previous,
    profile: { ...previous.profile, ...patch }
  }));
  const phone = state.profile.emergencyPhone.replace(/[^+\d]/g, '');

  return (
    <section className="platform-view support-view" aria-labelledby="checkin-title">
      <div className="view-heading">
        <div><p className="eyebrow">A gentle daily moment</p><h2 id="checkin-title">Daily Check-in</h2><p>No perfect answers needed. Record what feels right today.</p></div>
        <span className="local-only-badge">Saved locally</span>
      </div>

      {notificationMessage && <div className="notice-banner" role="status"><Bell size={20} />{notificationMessage}</div>}

      <div className="support-grid">
        <form className="support-card checkin-form" onSubmit={saveCheckIn}>
          <h3>How has today been?</h3>
          <div className="daily-checks">
            {[['medicine', 'Medicine taken', '💊'], ['meals', 'Meals enjoyed', '🍲'], ['walk', 'Walk or movement', '🚶']].map(([key, label, symbol]) => (
              <label key={key} className={form[key] ? 'checked' : ''}>
                <input type="checkbox" checked={form[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.checked }))} />
                <span>{symbol}</span>{label}<Check size={19} />
              </label>
            ))}
          </div>
          <fieldset className="mood-fieldset"><legend>How do you feel?</legend><div className="mood-options">{MOODS.map(mood => <button type="button" key={mood.id} className={form.mood === mood.id ? 'selected' : ''} onClick={() => setForm(current => ({ ...current, mood: mood.id }))}><span>{mood.symbol}</span>{mood.label}</button>)}</div></fieldset>
          <label className="stacked-field"><span>One thing you remember from today</span><textarea rows="3" maxLength="240" value={form.recentEvent} onChange={event => setForm(current => ({ ...current, recentEvent: event.target.value }))} placeholder="Tea with Mina, a garden walk…" /></label>
          <button className="game-primary-btn" type="submit">Save today’s check-in</button>
          {savedMessage && <p className="success-message" role="status">{savedMessage}</p>}
        </form>

        <div className="support-column">
          <section className="support-card reminders-card">
            <div className="card-heading-row"><div><p className="eyebrow">On-device</p><h3>Reminders</h3></div><button className="icon-text-btn" onClick={requestNotifications}><Bell size={18} /> Notifications</button></div>
            <form className="reminder-form" onSubmit={addReminder}>
              <input aria-label="Reminder label" required maxLength="60" value={reminderForm.label} onChange={event => setReminderForm(current => ({ ...current, label: event.target.value }))} placeholder="Medicine" />
              <input aria-label="Reminder time" type="time" required value={reminderForm.time} onChange={event => setReminderForm(current => ({ ...current, time: event.target.value }))} />
              <button aria-label="Add reminder" type="submit"><Plus size={20} /></button>
            </form>
            <div className="reminder-list">
              {state.reminders.length ? state.reminders.map(reminder => <div key={reminder.id} className="reminder-row"><button className={`reminder-toggle ${reminder.enabled ? 'on' : ''}`} aria-label={`${reminder.enabled ? 'Disable' : 'Enable'} ${reminder.label}`} onClick={() => onStateChange(previous => upsertReminder(previous, { ...reminder, enabled: !reminder.enabled }))}><span /></button><div><strong>{reminder.label}</strong><small>{reminder.time}</small></div><button className="delete-icon-btn" aria-label={`Delete ${reminder.label}`} onClick={() => onStateChange(previous => removeReminder(previous, reminder.id))}><Trash2 size={18} /></button></div>) : <p className="muted-copy">No reminders yet.</p>}
            </div>
          </section>

          <section className="support-card sos-card">
            <div className="card-heading-row"><div><p className="eyebrow">Quick support</p><h3>Emergency contact</h3></div><HeartPulse size={28} /></div>
            <label className="stacked-field"><span>Contact name</span><input value={state.profile.emergencyName} onChange={event => updateProfile({ emergencyName: event.target.value })} maxLength="60" placeholder="Mina" /></label>
            <label className="stacked-field"><span>Phone number</span><input type="tel" value={state.profile.emergencyPhone} onChange={event => updateProfile({ emergencyPhone: event.target.value })} maxLength="24" placeholder="+91…" /></label>
            {phone ? <a className="sos-call-btn" href={`tel:${phone}`}><Phone size={22} />Call {state.profile.emergencyName || 'emergency contact'}</a> : <button className="sos-call-btn" disabled><Phone size={22} />Add phone number to call</button>}
          </section>
        </div>
      </div>
    </section>
  );
}
