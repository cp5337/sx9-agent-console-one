import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { VoiceMessage as VoiceMessageType } from '../types';

interface VoiceMessageProps {
  voiceData: VoiceMessageType;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ voiceData }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 py-1">
      <button
        onClick={() => setIsPlaying(v => !v)}
        className="flex items-center justify-center w-7 h-7 bg-sx-active hover:bg-sx-hover border border-sx-border transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </button>

      <div className="flex-1">
        <div className="flex items-center space-x-px h-6">
          {voiceData.waveform.map((height, i) => (
            <div
              key={i}
              className="bg-current opacity-60"
              style={{ width: '2px', height: `${Math.max(2, height * 20)}px` }}
            />
          ))}
        </div>
      </div>

      <span className="text-xs opacity-75 flex-shrink-0">{formatDuration(voiceData.duration)}</span>
    </div>
  );
};
