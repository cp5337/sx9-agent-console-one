import React, { useState, useEffect } from 'react';
import { PersonaCard } from './components/PersonaCard';
import { ChatInterface } from './components/ChatInterface';
import { ChannelList } from './components/ChannelList';
import { KanbanBoard } from './components/KanbanBoard';
import { MetricsWidget } from './components/MetricsWidget';
import { WebSocketDebugger } from './components/WebSocketDebugger';
import { TalonPanel } from './components/talon/TalonPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { getWebSocketUrl } from './utils/url';
import {
  mockPersonas,
  mockChannels,
  mockMessages,
  mockTasks,
  mockMetrics
} from './data/mockData';
import {
  Persona,
  Channel,
  Message,
  Task,
  SystemMetric
} from './types';
import {
  Command,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  Shield,
  Activity,
  Network
} from 'lucide-react';

function App() {
  const [personas] = useState<Persona[]>(mockPersonas);
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'tasks' | 'metrics' | 'talon'>('overview');

  const { isConnected, sendMessage } = useWebSocket(getWebSocketUrl());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartChat = (personaId: string) => {
    const existingChannel = channels.find(
      c => c.type === 'direct' && c.participants.includes(personaId)
    );
    if (existingChannel) {
      setActiveChannelId(existingChannel.id);
    } else {
      const newChannel: Channel = {
        id: `dm-${personaId}`,
        name: personas.find(p => p.id === personaId)?.name || 'Unknown',
        type: 'direct',
        participants: ['current-user', personaId],
        unreadCount: 0
      };
      setChannels(prev => [...prev, newChannel]);
      setActiveChannelId(newChannel.id);
    }
    setActiveTab('chat');
  };

  const handleVoiceCall = (personaId: string) => {
    console.log('Voice call:', personaId);
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      channelId: activeChannelId,
      content,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
    sendMessage({ type: 'message', data: newMessage });

    setTimeout(() => {
      const channel = channels.find(c => c.id === activeChannelId);
      if (channel?.type === 'direct') {
        const aiPersonaId = channel.participants.find(id => id !== 'current-user');
        if (aiPersonaId) {
          setMessages(prev => [...prev, {
            id: `msg-${Date.now()}-ai`,
            senderId: aiPersonaId,
            channelId: activeChannelId,
            content: `Processing: "${content}"`,
            timestamp: new Date().toISOString(),
            type: 'text'
          }]);
        }
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    console.log('Voice message:', audioBlob);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  const tabs = [
    { id: 'overview', label: 'Overview',      icon: Command },
    { id: 'chat',     label: 'Comms',         icon: MessageSquare },
    { id: 'tasks',    label: 'Operations',    icon: BarChart3 },
    { id: 'metrics',  label: 'Metrics',       icon: Activity },
    { id: 'talon',    label: 'Talon',         icon: Network },
  ];

  return (
    <div className="min-h-screen bg-sx-root text-sx-text">
      <header className="bg-sx-surface border-b border-sx-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-sx-glow" />
              <span className="text-lg font-medium text-sx-text tracking-wide">SX9</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-sx-ok animate-pulse' : 'bg-sx-error'}`} />
              <span className="text-xs text-sx-faint">{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-sx-elevated border border-sx-border px-2.5 py-1">
              <Zap className="w-3 h-3 text-sx-warning" />
              <span className="text-xs text-sx-faint">Hash enabled</span>
            </div>
            <button className="p-1.5 text-sx-faint hover:text-sx-text hover:bg-sx-hover transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <nav className="flex mt-4 border-b border-sx-border -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs border-b-2 transition-colors ${
                  active
                    ? 'border-sx-primary text-sx-glow'
                    : 'border-transparent text-sx-faint hover:text-sx-muted hover:border-sx-border'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-sx-surface border border-sx-border p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-4 h-4 text-sx-glow" />
                  <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Team</span>
                </div>
                <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[600px]">
                  {personas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onStartChat={handleStartChat}
                      onVoiceCall={handleVoiceCall}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="bg-sx-surface border border-sx-border p-4">
                <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">System Metrics</span>
                <div className="mt-4">
                  <MetricsWidget metrics={metrics} />
                </div>
              </div>
              <div className="bg-sx-surface border border-sx-border p-4">
                <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Board</span>
                <div className="mt-4">
                  <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <div className="bg-sx-surface border border-sx-border p-4">
                <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Activity</span>
                <div className="mt-4 space-y-2 overflow-y-auto theme-scrollbar max-h-[600px]">
                  {messages.slice(-5).map((message) => {
                    const sender = personas.find(p => p.id === message.senderId);
                    return (
                      <div key={message.id} className="flex items-start space-x-2.5 p-2.5 bg-sx-elevated border border-sx-border">
                        {sender && (
                          <img src={sender.avatar} alt={sender.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sx-text text-xs font-medium">{sender?.name || 'System'}</p>
                          <p className="text-sx-muted text-xs truncate">
                            {message.type === 'voice' ? 'Voice message' : message.content}
                          </p>
                          <p className="text-sx-faint text-xs">{new Date(message.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-sx-surface border border-sx-border p-4 h-full flex flex-col">
                <span className="text-xs font-medium text-sx-muted uppercase tracking-wider mb-4">Channels</span>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <ChannelList
                    channels={channels}
                    personas={personas}
                    activeChannelId={activeChannelId}
                    onChannelSelect={setActiveChannelId}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              {activeChannel ? (
                <ChatInterface
                  channel={activeChannel}
                  messages={channelMessages}
                  personas={personas}
                  currentUserId="current-user"
                  onSendMessage={handleSendMessage}
                  onSendVoice={handleSendVoice}
                />
              ) : (
                <div className="bg-sx-surface border border-sx-border p-8 h-full flex items-center justify-center">
                  <p className="text-sx-muted text-sm">Select a channel to start</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-sx-surface border border-sx-border p-6">
            <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          </div>
        )}

        {activeTab === 'talon' && (
          <TalonPanel personas={personas} />
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-sx-surface border border-sx-border p-6">
              <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Performance</span>
              <div className="mt-4">
                <MetricsWidget metrics={metrics} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-sx-surface border border-sx-border p-6">
                <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Endpoints</span>
                <div className="mt-4 space-y-1.5">
                  {[
                    { method: 'GET',  path: '/api/personas',  color: 'text-sx-success' },
                    { method: 'POST', path: '/api/ai/route',  color: 'text-sx-glow' },
                    { method: 'PUT',  path: '/api/tasks/:id', color: 'text-sx-warning' },
                    { method: 'WS',   path: '/ws',            color: 'text-sx-agent' },
                  ].map(ep => (
                    <div key={ep.path} className="flex justify-between items-center p-2 bg-sx-elevated border border-sx-border">
                      <span className={`font-mono text-xs ${ep.color}`}>{ep.method}</span>
                      <span className="text-sx-muted font-mono text-xs">{ep.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-sx-surface border border-sx-border p-6">
                <span className="text-xs font-medium text-sx-muted uppercase tracking-wider">Hash Cache</span>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Graph queries', value: '1,247 cached', color: 'text-sx-success' },
                    { label: 'AI routes',     value: '892 cached',   color: 'text-sx-success' },
                    { label: 'Metrics',       value: '156 cached',   color: 'text-sx-success' },
                    { label: 'Hit rate',      value: '94.7%',        color: 'text-sx-glow' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sx-muted text-sm">{item.label}</span>
                      <span className={`text-sm ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <WebSocketDebugger />
    </div>
  );
}

export default App;
