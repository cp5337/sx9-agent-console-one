import React, { useState, useRef, useEffect } from 'react';
import { Message, Persona, Channel } from '../types';
import { Send, Mic, MicOff, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { VoiceMessage } from './VoiceMessage';

interface ChatInterfaceProps {
  channel: Channel;
  messages: Message[];
  personas: Persona[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onSendVoice: (audioBlob: Blob) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  channel,
  messages,
  personas,
  currentUserId,
  onSendMessage,
  onSendVoice,
}) => {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        onSendVoice(new Blob(chunks, { type: 'audio/wav' }));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const getPersona = (id: string) => personas.find(p => p.id === id);
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-sx-surface border border-sx-border">
      <div className="flex items-center justify-between p-4 border-b border-sx-border">
        <div className="flex items-center space-x-3">
          {channel.type === 'direct' &&
            channel.participants.filter(id => id !== currentUserId).map(pid => {
              const p = getPersona(pid);
              return p ? (
                <div key={pid} className="flex items-center space-x-2">
                  <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full" />
                  <div>
                    <p className="text-sx-text text-sm font-medium">{p.name}</p>
                    <p className="text-sx-faint text-xs">{p.status}</p>
                  </div>
                </div>
              ) : null;
            })}
          {channel.type === 'group' && (
            <div>
              <p className="text-sx-text text-sm font-medium">{channel.name}</p>
              <p className="text-sx-faint text-xs">{channel.participants.length} members</p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {[Phone, Video, MoreVertical].map((Icon, i) => (
            <button key={i} className="p-2 text-sx-faint hover:text-sx-text hover:bg-sx-hover transition-colors">
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto theme-scrollbar p-4 space-y-4">
        {messages.map((msg) => {
          const sender = getPersona(msg.senderId);
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && sender && (
                  <img src={sender.avatar} alt={sender.name} className="w-7 h-7 rounded-full flex-shrink-0 mx-2" />
                )}
                <div className={isOwn ? 'mr-2' : 'ml-0'}>
                  {!isOwn && sender && (
                    <p className="text-sx-faint text-xs mb-1">{sender.name}</p>
                  )}
                  <div className={`px-3 py-2 ${isOwn ? 'bg-sx-primary text-white' : 'bg-sx-elevated text-sx-text border border-sx-border'}`}>
                    {msg.type === 'voice' && msg.voiceData ? (
                      <VoiceMessage voiceData={msg.voiceData} />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  <p className="text-sx-faint text-xs mt-1">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-sx-border">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-sx-faint hover:text-sx-text hover:bg-sx-hover transition-colors"
          >
            <Paperclip size={16} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full bg-sx-elevated border border-sx-border text-sx-text px-4 py-2 pr-10 glow-focus text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sx-glow hover:text-white disabled:text-sx-faint transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 transition-colors ${
              isRecording
                ? 'bg-sx-error text-white animate-pulse'
                : 'text-sx-faint hover:text-sx-text hover:bg-sx-hover'
            }`}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" multiple />
      </div>
    </div>
  );
};
