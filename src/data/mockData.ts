import { Persona, Channel, Message, Task, SystemMetric } from '../types';

export const mockPersonas: Persona[] = [
  {
    id: 'natasha-volkov',
    name: 'Natasha Volkov',
    role: 'Strategic Operations Lead',
    model: 'Claude-3.5 Sonnet',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    status: 'online',
    lastSeen: '2 minutes ago',
    capabilities: ['Strategic Planning', 'Risk Analysis', 'Team Coordination', 'Crisis Management']
  },
  {
    id: 'marcus-chen',
    name: 'Marcus Chen',
    role: 'Technical Systems Architect',
    model: 'GPT-4 Turbo',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    status: 'busy',
    lastSeen: '5 minutes ago',
    capabilities: ['System Architecture', 'Performance Optimization', 'Security Analysis', 'Code Review']
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    role: 'Intelligence Analyst',
    model: 'Claude-3 Opus',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    status: 'online',
    lastSeen: '1 minute ago',
    capabilities: ['Data Analysis', 'Pattern Recognition', 'Threat Assessment', 'Report Generation']
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    role: 'Communications Specialist',
    model: 'GPT-4',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    status: 'away',
    lastSeen: '15 minutes ago',
    capabilities: ['Public Relations', 'Crisis Communication', 'Media Strategy', 'Content Creation']
  },
  {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    role: 'Operations Coordinator',
    model: 'Claude-3 Haiku',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    status: 'online',
    lastSeen: 'Just now',
    capabilities: ['Project Management', 'Resource Allocation', 'Timeline Planning', 'Quality Assurance']
  },
  {
    id: 'alex-petrov',
    name: 'Alex Petrov',
    role: 'Cybersecurity Expert',
    model: 'GPT-4 Turbo',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    status: 'offline',
    lastSeen: '2 hours ago',
    capabilities: ['Threat Detection', 'Incident Response', 'Security Auditing', 'Penetration Testing']
  }
];

export const mockChannels: Channel[] = [
  {
    id: 'general',
    name: 'General',
    type: 'group',
    participants: ['current-user', 'natasha-volkov', 'marcus-chen', 'elena-rodriguez'],
    unreadCount: 3,
    lastMessage: {
      id: 'msg-1',
      senderId: 'natasha-volkov',
      content: 'Team meeting in 10 minutes',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'text'
    }
  },
  {
    id: 'dm-natasha',
    name: 'Natasha Volkov',
    type: 'direct',
    participants: ['current-user', 'natasha-volkov'],
    unreadCount: 1,
    lastMessage: {
      id: 'msg-2',
      senderId: 'natasha-volkov',
      content: 'Can you review the latest threat assessment?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'text'
    }
  },
  {
    id: 'dm-marcus',
    name: 'Marcus Chen',
    type: 'direct',
    participants: ['current-user', 'marcus-chen'],
    unreadCount: 0,
    lastMessage: {
      id: 'msg-3',
      senderId: 'current-user',
      content: 'Thanks for the system update',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'text'
    }
  },
  {
    id: 'operations',
    name: 'Operations',
    type: 'group',
    participants: ['current-user', 'sarah-johnson', 'elena-rodriguez'],
    unreadCount: 0,
    lastMessage: {
      id: 'msg-4',
      senderId: 'sarah-johnson',
      content: 'All systems operational',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'text'
    }
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'natasha-volkov',
    channelId: 'general',
    content: 'Good morning team. We have several high-priority items to discuss today.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'text'
  },
  {
    id: 'msg-2',
    senderId: 'marcus-chen',
    channelId: 'general',
    content: 'System performance is looking good. All metrics are within normal ranges.',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    type: 'text'
  },
  {
    id: 'msg-3',
    senderId: 'elena-rodriguez',
    channelId: 'general',
    content: 'I\'ve completed the threat analysis. No immediate concerns detected.',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    type: 'text'
  },
  {
    id: 'msg-4',
    senderId: 'current-user',
    channelId: 'general',
    content: 'Excellent work everyone. Let\'s maintain this momentum.',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    type: 'text'
  },
  {
    id: 'msg-5',
    senderId: 'natasha-volkov',
    channelId: 'general',
    content: '',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    type: 'voice',
    voiceData: {
      duration: 15,
      waveform: [0.2, 0.4, 0.6, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.2, 0.6, 0.8, 0.3, 0.5, 0.7],
      isPlaying: false
    }
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'System Security Audit',
    description: 'Comprehensive security review of all critical systems',
    assignedTo: 'Alex Petrov',
    priority: 'critical',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    tags: ['security', 'audit', 'critical']
  },
  {
    id: 'task-2',
    title: 'Performance Optimization',
    description: 'Optimize database queries and API response times',
    assignedTo: 'Marcus Chen',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    tags: ['performance', 'database', 'api']
  },
  {
    id: 'task-3',
    title: 'Threat Intelligence Report',
    description: 'Weekly threat intelligence summary and recommendations',
    assignedTo: 'Elena Rodriguez',
    priority: 'medium',
    status: 'review',
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    tags: ['intelligence', 'report', 'weekly']
  },
  {
    id: 'task-4',
    title: 'Team Training Session',
    description: 'Conduct security awareness training for all team members',
    assignedTo: 'Sarah Johnson',
    priority: 'medium',
    status: 'done',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    tags: ['training', 'security', 'team']
  },
  {
    id: 'task-5',
    title: 'Communication Protocol Update',
    description: 'Update emergency communication procedures',
    assignedTo: 'David Kim',
    priority: 'low',
    status: 'todo',
    dueDate: new Date(Date.now() + 345600000).toISOString(),
    tags: ['communication', 'protocol', 'emergency']
  }
];

export const mockMetrics: SystemMetric[] = [
  {
    id: 'cpu-usage',
    name: 'CPU Usage',
    value: 67,
    unit: '%',
    trend: 'stable',
    status: 'healthy'
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    value: 82,
    unit: '%',
    trend: 'up',
    status: 'warning'
  },
  {
    id: 'network-latency',
    name: 'Network Latency',
    value: 45,
    unit: 'ms',
    trend: 'down',
    status: 'healthy'
  },
  {
    id: 'active-connections',
    name: 'Active Connections',
    value: 1247,
    unit: 'conn',
    trend: 'up',
    status: 'healthy'
  },
  {
    id: 'error-rate',
    name: 'Error Rate',
    value: 0.3,
    unit: '%',
    trend: 'stable',
    status: 'healthy'
  },
  {
    id: 'response-time',
    name: 'Response Time',
    value: 156,
    unit: 'ms',
    trend: 'down',
    status: 'healthy'
  }
];