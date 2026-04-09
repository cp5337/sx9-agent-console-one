import { Persona, Message, Channel, Task, SystemMetric } from '../types';
import { getBackendBaseUrl } from '../utils/url';

const API_BASE = `${getBackendBaseUrl()}/api`;

class ApiService {
  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.log('Backend health check failed:', error);
      return false;
    }
  }

  // Persona Management
  async getPersonas(): Promise<Persona[]> {
    const response = await fetch(`${API_BASE}/personas`);
    return response.json();
  }

  async updatePersonaStatus(personaId: string, status: string): Promise<void> {
    await fetch(`${API_BASE}/personas/${personaId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  // Communications
  async getChannels(): Promise<Channel[]> {
    const response = await fetch(`${API_BASE}/channels`);
    return response.json();
  }

  async getMessages(channelId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/channels/${channelId}/messages`);
    return response.json();
  }

  async sendMessage(channelId: string, content: string, type: string = 'text'): Promise<Message> {
    const response = await fetch(`${API_BASE}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type })
    });
    return response.json();
  }

  async sendVoiceMessage(channelId: string, audioBlob: Blob): Promise<Message> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('channelId', channelId);

    const response = await fetch(`${API_BASE}/voice/send`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  // Task Management
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/tasks`);
    return response.json();
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return response.json();
  }

  // System Metrics
  async getMetrics(): Promise<SystemMetric[]> {
    const response = await fetch(`${API_BASE}/metrics`);
    return response.json();
  }

  // Hash-enabled operations
  async queryGraph(pattern: string): Promise<any> {
    const response = await fetch(`${API_BASE}/graph/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern })
    });
    return response.json();
  }

  async routeAI(persona: string, queryType: string, query: string): Promise<any> {
    const response = await fetch(`${API_BASE}/ai/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona, queryType, query })
    });
    return response.json();
  }

  // WebSocket connection for real-time updates
  connectWebSocket(): WebSocket {
    const wsUrl = getBackendBaseUrl().replace('http://', 'ws://') + '/ws';
    const ws = new WebSocket(wsUrl);
    return ws;
  }
}

export const apiService = new ApiService();