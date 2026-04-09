import React from 'react';
import { Channel, Persona } from '../types';
import { Hash, Users, MessageCircle } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  personas: Persona[];
  activeChannelId?: string;
  onChannelSelect: (channelId: string) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  personas,
  activeChannelId,
  onChannelSelect,
}) => {
  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'direct': return <MessageCircle size={15} className="text-sx-faint" />;
      case 'group':  return <Users size={15} className="text-sx-faint" />;
      default:       return <Hash size={15} className="text-sx-faint" />;
    }
  };

  const getChannelName = (channel: Channel) => {
    if (channel.type === 'direct') {
      const other = channel.participants.find(id => id !== 'current-user');
      return personas.find(p => p.id === other)?.name ?? 'Unknown';
    }
    return channel.name;
  };

  const getChannelAvatar = (channel: Channel) => {
    if (channel.type === 'direct') {
      const other = channel.participants.find(id => id !== 'current-user');
      return personas.find(p => p.id === other)?.avatar;
    }
    return null;
  };

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    const diff = (Date.now() - d.getTime()) / 3_600_000;
    return diff < 24
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString();
  };

  return (
    <div className="space-y-0.5">
      {channels.map((channel) => {
        const avatar = getChannelAvatar(channel);
        const isActive = channel.id === activeChannelId;

        return (
          <div
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`flex items-center space-x-3 p-3 cursor-pointer transition-all border ${
              isActive
                ? 'bg-sx-hover border-sx-primary'
                : 'border-transparent hover:bg-sx-hover'
            }`}
          >
            <div className="flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt={getChannelName(channel)} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-sx-active border border-sx-border flex items-center justify-center">
                  {getChannelIcon(channel)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-sx-glow' : 'text-sx-text'}`}>
                  {getChannelName(channel)}
                </p>
                {channel.lastMessage && (
                  <span className="text-sx-faint text-xs flex-shrink-0 ml-2">{formatTime(channel.lastMessage.timestamp)}</span>
                )}
              </div>
              {channel.lastMessage && (
                <p className="text-sx-muted text-xs truncate">
                  {channel.lastMessage.type === 'voice' ? 'Voice message' : channel.lastMessage.content}
                </p>
              )}
            </div>

            {channel.unreadCount > 0 && (
              <span className="flex-shrink-0 bg-sx-primary text-white text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
