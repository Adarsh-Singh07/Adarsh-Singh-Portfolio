import { ProfileData, ProfileMode, RoleDefinition } from '../types';
import { generalProfile, dataEngineerProfile } from '../data/profileModes';

/**
 * Service to abstract data fetching for the portfolio.
 * Designed to connect to a legacy or future Python backend (FastAPI, Django, Flask, etc.)
 */
export class PortfolioService {
  private static useMock = false;
  private static apiBaseUrl = '/api/v1/portfolio';

  /**
   * Retrieves profile data based on state or active mode.
   * Easily queries a backend service in production.
   */
  public static async getProfileData(mode: ProfileMode): Promise<ProfileData> {
    if (this.useMock) {
      // Simulate network request delays for realistic performance
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mode === 'data-engineer' ? dataEngineerProfile : generalProfile);
        }, 120); // speedy transition
      });
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/profile?mode=${mode}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch and integrate backend profile stats: ${response.statusText}`);
      }
      return await response.json() as ProfileData;
    } catch (error) {
      console.warn('Backend connection failed, falling back to local configurations:', error);
      return mode === 'data-engineer' ? dataEngineerProfile : generalProfile;
    }
  }

  /**
   * Retrieves the list of dynamic roles defined in the backend.
   */
  public static async getRoles(): Promise<RoleDefinition[]> {
    if (this.useMock) {
      return [
        { id: 'general', label: 'General AI/Data', icon: 'Layers' },
        { id: 'data-engineer', label: 'Data Engineer', icon: 'Database' }
      ];
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/roles`);
      if (!response.ok) {
        throw new Error(`Failed to fetch roles metadata: ${response.statusText}`);
      }
      return await response.json() as RoleDefinition[];
    } catch (error) {
      console.warn('Roles fetch failed, falling back to basic default roles:', error);
      return [
        { id: 'general', label: 'General AI/Data', icon: 'Layers' },
        { id: 'data-engineer', label: 'Data Engineer', icon: 'Database' }
      ];
    }
  }

  /**
   * Dispatches a message request (e.g. contact form submit) to the future backend.
   */
  public static async submitContactMessage(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      console.log('Dispatching message payload to simulated mail server:', payload);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Your transmission is secured. Adarsh will reach out within 24 hours.' });
        }, 400);
      });
    }

    const response = await fetch(`${this.apiBaseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Message dispatch failed to connect to standard gateway.');
    }

    return await response.json();
  }

  /**
   * Connects to the RAG Gemini chatbot endpoint.
   */
  public static async chatWithAI(
    message: string,
    history: Array<{ role: string; content: string }>,
    session_id?: string,
    mode: ProfileMode = 'general',
    model_override?: string
  ): Promise<{ 
    response: string; 
    session_id: string; 
    message_id: string; 
    trace?: {
      model_used?: string;
      latency_ms: number;
      tokens_input: number;
      tokens_output: number;
      cost_est: number;
      chunks: Array<{ title: string; source: string; similarity: number }>;
    };
  }> {
    if (this.useMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            response: `I'm currently in simulated mode. In a live environment, I would answer based on my CV and skills! You asked: "${message}".`,
            session_id: session_id || 'mock-session-id',
            message_id: 'mock-msg-id-' + Math.random(),
            trace: {
              model_used: 'gemini-2.5-flash',
              latency_ms: 120,
              tokens_input: 120,
              tokens_output: 45,
              cost_est: 0.00001,
              chunks: [
                { title: 'Mock Chunk 1', source: 'cv.txt', similarity: 0.85 },
                { title: 'Mock Chunk 2', source: 'profile.json', similarity: 0.72 }
              ]
            }
          });
        }, 800);
      });
    }

    const response = await fetch(`${this.apiBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, session_id, mode, model_override }),
    });

    if (!response.ok) {
      throw new Error('Chatbot backend connection failed.');
    }

    return await response.json() as any;
  }

  /**
   * Submits recruiter thumbs feedback for a message.
   */
  public static async submitChatFeedback(
    message_id: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Mock feedback logged.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/chat/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id, rating, comment }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit chat feedback.');
    }
    return await response.json();
  }

  /**
   * Retrieves chatbot analytics metrics.
   */
  public static async getAnalyticsStats(): Promise<any> {
    if (this.useMock) {
      return {
        total_sessions: 24,
        total_messages: 98,
        total_leads: 6,
        helpful_percentage: 92,
        feedback_stats: { helpful: 12, unhelpful: 1 },
        avg_latency_ms: 2400,
        tokens_used: { input: 120400, output: 43200, total: 163600 },
        estimated_cost_usd: 0.023,
        mode_distribution: { general: 12, "data-engineer": 8, "ai-engineer": 4 },
        intent_distribution: { "Hiring Inquiry": 3, "Collaboration": 2, "General Question": 1 }
      };
    }
    const response = await fetch(`${this.apiBaseUrl}/analytics/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics statistics.');
    }
    return await response.json();
  }

  /**
   * Verifies passcode for developer access to dashboard data.
   */
  public static async verifyPasscode(passcode: string): Promise<{ success: boolean }> {
    if (this.useMock) {
      return { success: passcode === 'admin123' };
    }
    const response = await fetch(`${this.apiBaseUrl}/analytics/verify-passcode`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-Passcode': passcode 
      },
      body: JSON.stringify({ passcode }),
    });
    if (!response.ok) {
      throw new Error('Failed to verify developer passcode.');
    }
    return await response.json();
  }

  /**
   * Retrieves conversation history sessions and contact messages list.
   */
  public static async getAnalyticsLogs(passcode?: string): Promise<{
    is_admin: boolean;
    sessions: any[];
    leads: any[];
  }> {
    if (this.useMock) {
      return {
        is_admin: passcode === 'admin123',
        sessions: [
          {
            id: 'mock-session-1',
            created_at: '2026-06-26T18:00:00Z',
            role_mode: 'data-engineer',
            messages: [
              { id: '1', role: 'user', content: 'What spark projects do you have?', created_at: '2026-06-26T18:00:01Z' },
              {
                id: '2', role: 'model', content: 'I have worked on several Spark data pipelines...', created_at: '2026-06-26T18:00:03Z',
                retrieved_chunks: [{ title: 'Project: Delta Lake Ingestion', source: 'profile.json', similarity: 0.89 }],
                latency_ms: 1500, tokens_input: 450, tokens_output: 120, cost_est: 0.00004, rating: 1
              }
            ]
          }
        ],
        leads: [
          {
            id: 1,
            name: passcode === 'admin123' ? 'Sarah Jenkins' : 'S*** J***',
            email: passcode === 'admin123' ? 'sarah@uber.com' : 's***h@uber.com',
            subject: 'Interview request for Uber Data team',
            message: passcode === 'admin123'
              ? 'Hello Adarsh, would love to set up an interview for you next Tuesday!'
              : '[Message content locked for recruiter privacy. Enter passcode at the top to decrypt.]',
            created_at: '2026-06-26T14:32:00Z',
            intent_category: 'Hiring Inquiry'
          }
        ]
      };
    }

    const headers: Record<string, string> = {};
    if (passcode) {
      headers['X-Admin-Passcode'] = passcode;
    }
      
    const response = await fetch(`${this.apiBaseUrl}/analytics/logs`, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) {
      throw new Error('Failed to retrieve chat and contact logs.');
    }
    return await response.json();
  }

  /**
   * Tests RAG search.
   */
  public static async testRagSearch(query: string): Promise<any[]> {
    if (this.useMock) {
      return [
        { chunk_title: 'Project: Spark ETL', source_file: 'profile.json', content: 'Details about Spark ETL...', similarity: 0.88 },
        { chunk_title: 'CV: Adarsh Singh', source_file: 'cv.txt', content: 'Detailed profile of Adarsh...', similarity: 0.74 }
      ];
    }
    const response = await fetch(`${this.apiBaseUrl}/rag/playground?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to run RAG search playground.');
    }
    return await response.json();
  }

  /**
   * Fetches latest stellar project metrics from real github api if needed (future implementation).
   */
  public static async getGithubMetrics(username: string): Promise<{ stars: number; repos: number }> {
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) throw new Error('Github api call failed.');
      const data = await res.json();
      return {
        stars: 45, // default fallback or customized star calculation
        repos: data.public_repos || 12
      };
    } catch {
      return { stars: 32, repos: 14 };
    }
  }

  /**
   * Retrieves logged unanswered questions from the backend.
   */
  public static async getUnansweredQuestions(passcode?: string): Promise<any[]> {
    if (this.useMock) {
      return [
        { id: 1, session_id: 'mock-session-1', question: 'Do you have experience with Kubernetes?', created_at: '2026-06-26T18:00:00Z', resolved: 0 },
        { id: 2, session_id: 'mock-session-2', question: 'How many years of experience do you have with Rust?', created_at: '2026-06-27T12:00:00Z', resolved: 0 }
      ];
    }
    const headers: Record<string, string> = {};
    if (passcode) {
      headers['X-Admin-Passcode'] = passcode;
    }
    const response = await fetch(`${this.apiBaseUrl}/analytics/unanswered`, {
      method: 'GET',
      headers: headers
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unanswered questions.');
    }
    return await response.json();
  }

  /**
   * Marks an unanswered question as resolved.
   */
  public static async resolveUnansweredQuestion(q_id: number, passcode: string): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Mock question resolved.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/analytics/unanswered/resolve/${q_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Passcode': passcode
      },
      body: JSON.stringify({ passcode })
    });
    if (!response.ok) {
      throw new Error('Failed to resolve unanswered question.');
    }
    return await response.json();
  }

  /**
   * Retrieves the chatbot model list and their current status (available or exhausted).
   */
  public static async getChatModels(): Promise<any[]> {
    if (this.useMock) {
      return [
        { id: 'gemini-2.5-flash', label: 'GEMINI 2.5 FLASH', status: 'available' },
        { id: 'gemini-2.5-flash-lite', label: 'GEMINI 2.5 FLASH-LITE', status: 'available' },
        { id: 'gemini-2.0-flash', label: 'GEMINI 2.0 FLASH', status: 'available' },
        { id: 'gemini-2.0-flash-lite', label: 'GEMINI 2.0 FLASH-LITE', status: 'available' },
        { id: 'gemini-1.5-flash', label: 'GEMINI 1.5 FLASH', status: 'available' },
        { id: 'gemini-flash-latest', label: 'GEMINI FLASH LATEST', status: 'available' },
        { id: 'gemini-flash-lite-latest', label: 'GEMINI FLASH-LITE LATEST', status: 'available' },
        { id: 'gemini-3.5-flash', label: 'GEMINI 3.5 FLASH', status: 'available' }
      ];
    }
    const response = await fetch(`${this.apiBaseUrl}/chat/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch chatbot models status.');
    }
    return await response.json();
  }

  /**
   * Logs in admin with username and password.
   */
  public static async adminLogin(username: string, password: string): Promise<{ success: boolean; token: string }> {
    if (this.useMock) {
      return { success: username === 'admin' && password === 'admin123', token: 'mock-admin-token-12345' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error('Authentication failed.');
    }
    return await response.json();
  }

  /**
   * Fetches full configuration (profile.json structure).
   */
  public static async getAdminConfig(token: string): Promise<Record<ProfileMode, ProfileData>> {
    if (this.useMock) {
      return {
        general: generalProfile,
        'data-engineer': dataEngineerProfile,
        'ai-engineer': generalProfile, // fallback for mock
      } as any;
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/config`, {
      method: 'GET',
      headers: {
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      throw new Error('Failed to retrieve configurations.');
    }
    return await response.json();
  }

  /**
   * Saves/publishes updated configuration.
   */
  public static async saveAdminConfig(token: string, config: Record<string, ProfileData>): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Configuration saved mock-mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to save configuration.');
    }
    return await response.json();
  }

  /**
   * Changes admin credentials (username and password).
   */
  public static async changeCredentials(
    token: string,
    currentPassword: string,
    newUsername: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Credentials updated in mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/change-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_username: newUsername, new_password: newPassword }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to update credentials.');
    }
    return await response.json();
  }

  /**
   * Uploads profile photo.
   */
  public static async uploadAvatar(token: string, fileData: string): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Avatar image uploaded mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ file_data: fileData }),
    });
    if (!response.ok) {
      throw new Error('Failed to upload avatar image.');
    }
    return await response.json();
  }

  /**
   * Uploads CV PDF.
   */
  public static async uploadCv(token: string, fileData: string): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'CV PDF uploaded mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/upload/cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ file_data: fileData }),
    });
    if (!response.ok) {
      throw new Error('Failed to upload CV PDF.');
    }
    return await response.json();
  }

  /**
   * Retrieves SMTP and Resend configuration (passwords masked).
   */
  public static async getSmtpSettings(token: string): Promise<any> {
    if (this.useMock) {
      return {
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_USER: 'adarsh2001gop@gmail.com',
        SMTP_PASSWORD: '********',
        SMTP_TO: 'adarsh2001gop@gmail.com',
        RESEND_API_KEY: '********',
        RESEND_FROM: 'onboarding@resend.dev'
      };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/smtp`, {
      method: 'GET',
      headers: {
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to retrieve SMTP settings.');
    }
    return await response.json();
  }

  /**
   * Saves SMTP and Resend API settings.
   */
  public static async saveSmtpSettings(token: string, settings: any): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'SMTP settings saved mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    if (!response.ok) {
      throw new Error('Failed to save SMTP settings.');
    }
    return await response.json();
  }

  /**
   * Adds or updates a dynamic profile role switcher.
   */
  public static async addOrUpdateRole(token: string, roleData: { id: string; label: string; icon: string; copy_from?: string }): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Role saved mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roleData)
    });
    if (!response.ok) {
      throw new Error('Failed to configure dynamic profile role.');
    }
    return await response.json();
  }

  /**
   * Deletes a dynamic profile role switcher.
   */
  public static async deleteRole(roleId: string, token: string): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Role deleted mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/admin/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete dynamic profile role.');
    }
    return await response.json();
  }

  /**
   * Submits an answer for an unanswered recruiter query.
   */
  public static async answerUnansweredQuestion(q_id: number, question: string, answer: string, token: string): Promise<{ success: boolean; message: string }> {
    if (this.useMock) {
      return { success: true, message: 'Answer saved mock mode.' };
    }
    const response = await fetch(`${this.apiBaseUrl}/analytics/unanswered/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Passcode': token,
        'X-Admin-Token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ q_id, question, answer })
    });
    if (!response.ok) {
      throw new Error('Failed to submit question answer.');
    }
    return await response.json();
  }
}
export default PortfolioService;
