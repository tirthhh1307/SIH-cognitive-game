import React, { useState, useEffect, useRef } from 'react';
import AvatarCanvas from './AvatarCanvas.jsx';
import { AudioSyncPlayer } from '../../utils/avatar/audioSyncEngine.js';

export default function AvatarViewer({ modelUrl, audioPayload, onPlaybackComplete, className = '' }) {
  const [currentWeights, setCurrentWeights] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    playerRef.current = new AudioSyncPlayer();
    return () => {
      if (playerRef.current) playerRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (audioPayload && audioPayload.audioUrl && audioPayload.visemes) {
      setIsSpeaking(true);
      playerRef.current.load(audioPayload.audioUrl, audioPayload.visemes);
      playerRef.current.play(
        (weights) => setCurrentWeights(weights),
        () => {
          setIsSpeaking(false);
          setCurrentWeights({});
          if (onPlaybackComplete) onPlaybackComplete();
        }
      );
    }
  }, [audioPayload, onPlaybackComplete]);

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full ${className}`}>
      <AvatarCanvas modelUrl={modelUrl} morphWeights={currentWeights} isSpeaking={isSpeaking} />
    </div>
  );
}
