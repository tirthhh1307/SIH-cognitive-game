import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Mic, ShieldCheck, Trash2, Users } from 'lucide-react';
import { deleteAnchor, putAnchor, validateAnchorInput } from '../utils/mediaStore';

function AnchorCard({ anchor, onDelete }) {
  const photoUrl = useMemo(() => anchor.photoBlob ? URL.createObjectURL(anchor.photoBlob) : '', [anchor.photoBlob]);
  const audioUrl = useMemo(() => anchor.audioBlob ? URL.createObjectURL(anchor.audioBlob) : '', [anchor.audioBlob]);
  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [photoUrl, audioUrl]);
  return <article className="anchor-card">
    <div className="anchor-photo">{photoUrl ? <img src={photoUrl} alt={anchor.name} /> : <Users size={38} aria-hidden="true" />}</div>
    <div className="anchor-info"><h3>{anchor.name}</h3><p>{anchor.relationship}</p>{audioUrl ? <audio controls src={audioUrl} aria-label={`Voice note from ${anchor.name}`} /> : <small>No voice note</small>}</div>
    <button className="delete-icon-btn" onClick={() => onDelete(anchor)} aria-label={`Delete memory for ${anchor.name}`}><Trash2 size={18} /></button>
  </article>;
}

export function MemoryAnchors({ anchors, onChanged }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photoBlob, setPhotoBlob] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const save = async event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const input = { name, relationship, photoBlob, audioBlob };
    const validationError = validateAnchorInput(input);
    if (validationError) { setError(validationError); return; }
    try {
      await putAnchor({
        ...input,
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
        createdAt: new Date().toISOString()
      });
      setName(''); setRelationship(''); setPhotoBlob(null); setAudioBlob(null); setError('');
      setMessage(`${name.trim()} is ready for personalized games.`);
      await onChanged();
      formElement.reset();
    } catch {
      setError('Could not save on this device. Existing memories are unchanged.');
    }
  };

  const remove = async anchor => {
    if (!window.confirm(`Delete the local memory for ${anchor.name}?`)) return;
    try { await deleteAnchor(anchor.id); await onChanged(); }
    catch { setError('Could not delete this memory. Nothing else was changed.'); }
  };

  return <section className="platform-view support-view anchors-view" aria-labelledby="anchors-title">
    <div className="view-heading"><div><p className="eyebrow">Personalized & private</p><h2 id="anchors-title">Memory Anchors</h2><p>Add familiar people for face, family-tree, photo, and voice games.</p></div><span className="local-only-badge"><ShieldCheck size={18} />On this device</span></div>
    <div className="anchor-layout">
      <form className="support-card anchor-form" onSubmit={save}>
        <h3>Add a familiar person</h3>
        <label className="stacked-field"><span>Name</span><input required maxLength="60" value={name} onChange={event => setName(event.target.value)} placeholder="Mina" /></label>
        <label className="stacked-field"><span>Relationship</span><input required maxLength="60" value={relationship} onChange={event => setRelationship(event.target.value)} placeholder="Daughter" /></label>
        <label className="file-field"><ImagePlus size={23} /><span><strong>Photo</strong><small>JPG, PNG, or WebP · max 5 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setPhotoBlob(event.target.files?.[0] ?? null)} /></label>
        <label className="file-field"><Mic size={23} /><span><strong>Voice note</strong><small>Any browser-supported audio · max 8 MB</small></span><input type="file" accept="audio/*" onChange={event => setAudioBlob(event.target.files?.[0] ?? null)} /></label>
        <button className="game-primary-btn" type="submit">Save memory anchor</button>
        {error && <p className="error-message" role="alert">{error}</p>}
        {message && !error && <p className="success-message" role="status">{message}</p>}
      </form>
      <div className="anchor-list-panel">
        <div className="card-heading-row"><div><p className="eyebrow">Care circle</p><h3>{anchors.length} familiar people</h3></div></div>
        {anchors.length ? <div className="anchor-list">{anchors.map(anchor => <AnchorCard key={anchor.id} anchor={anchor} onDelete={remove} />)}</div> : <div className="empty-state"><Users size={40} /><h3>No family memories added yet</h3><p>Demo family content keeps personalized games playable.</p></div>}
      </div>
    </div>
  </section>;
}
