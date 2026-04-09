import React from 'react';
import { Persona } from '../types';
import { MessageCircle, Phone, Video } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onStartChat: (personaId: string) => void;
  onVoiceCall: (personaId: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onStartChat, onVoiceCall }) => {
  const statusColors: Record<Persona['status'], string> = {
    online:  'bg-sx-success',
    busy:    'bg-sx-error',
    away:    'bg-sx-warning',
    offline: 'bg-sx-faint',
  };

  return (
    <div className="bg-sx-elevated border border-sx-border p-3 hover:bg-sx-hover hover:border-sx-primary transition-all">
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative flex-shrink-0">
          <img
            src={persona.avatar}
            alt={persona.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[persona.status]} rounded-full border-2 border-sx-elevated ${persona.status === 'online' ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sx-text text-sm font-medium truncate">{persona.name}</p>
          <p className="text-sx-muted text-xs truncate">{persona.role}</p>
          <p className="text-sx-glow text-xs truncate">{persona.model}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {persona.capabilities.slice(0, 3).map((cap, i) => (
          <span key={i} className="px-2 py-0.5 bg-sx-root border border-sx-border text-sx-muted text-xs">
            {cap}
          </span>
        ))}
        {persona.capabilities.length > 3 && (
          <span className="px-2 py-0.5 bg-sx-root border border-sx-border text-sx-faint text-xs">
            +{persona.capabilities.length - 3}
          </span>
        )}
      </div>

      <div className="flex space-x-1.5">
        <button
          onClick={() => onStartChat(persona.id)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-sx-primary hover:opacity-90 text-white px-3 py-1.5 text-xs transition-opacity"
        >
          <MessageCircle size={12} />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onVoiceCall(persona.id)}
          className="flex items-center justify-center bg-sx-active hover:bg-sx-hover text-sx-text px-3 py-1.5 transition-colors"
        >
          <Phone size={12} />
        </button>
        <button className="flex items-center justify-center bg-sx-active hover:bg-sx-hover text-sx-text px-3 py-1.5 transition-colors">
          <Video size={12} />
        </button>
      </div>

      <p className="mt-2 text-xs text-sx-faint">Last seen: {persona.lastSeen}</p>
    </div>
  );
};
