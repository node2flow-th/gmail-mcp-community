/**
 * Gmail API v1 Client — OAuth 2.0 refresh token pattern
 */

import type {
  Message,
  MessageList,
  Thread,
  ThreadList,
  Label,
  LabelList,
  Draft,
  DraftList,
  Profile,
  VacationSettings,
  Attachment,
} from './types.js';

export interface GmailClientConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class GmailClient {
  private config: GmailClientConfig;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  private static readonly BASE = 'https://gmail.googleapis.com/gmail/v1';
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';

  constructor(config: GmailClientConfig) {
    this.config = config;
  }

  // ========== OAuth ==========

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const res = await fetch(GmailClient.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token refresh failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request(path: string, options: RequestInit = {}): Promise<unknown> {
    const token = await this.getAccessToken();
    const url = `${GmailClient.BASE}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gmail API error (${res.status}): ${text}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return {};
  }

  // ========== RFC 2822 Message Builder ==========

  private buildRawMessage(opts: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    html?: string;
    in_reply_to?: string;
    references?: string;
  }): string {
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const lines: string[] = [];

    lines.push(`To: ${opts.to}`);
    if (opts.cc) lines.push(`Cc: ${opts.cc}`);
    if (opts.bcc) lines.push(`Bcc: ${opts.bcc}`);
    lines.push(`Subject: =?UTF-8?B?${this.base64Encode(opts.subject)}?=`);
    if (opts.in_reply_to) lines.push(`In-Reply-To: ${opts.in_reply_to}`);
    if (opts.references) lines.push(`References: ${opts.references}`);
    lines.push('MIME-Version: 1.0');

    if (opts.html) {
      lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
      lines.push('');
      lines.push(`--${boundary}`);
      lines.push('Content-Type: text/plain; charset="UTF-8"');
      lines.push('Content-Transfer-Encoding: base64');
      lines.push('');
      lines.push(this.base64Encode(opts.body));
      lines.push(`--${boundary}`);
      lines.push('Content-Type: text/html; charset="UTF-8"');
      lines.push('Content-Transfer-Encoding: base64');
      lines.push('');
      lines.push(this.base64Encode(opts.html));
      lines.push(`--${boundary}--`);
    } else {
      lines.push('Content-Type: text/plain; charset="UTF-8"');
      lines.push('Content-Transfer-Encoding: base64');
      lines.push('');
      lines.push(this.base64Encode(opts.body));
    }

    const raw = lines.join('\r\n');
    return this.base64UrlEncode(raw);
  }

  private base64Encode(str: string): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  private base64UrlEncode(str: string): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64url');
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // ========== Messages (10) ==========

  async listMessages(opts: {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
    includeSpamTrash?: boolean;
  }): Promise<MessageList> {
    const params = new URLSearchParams();
    if (opts.q) params.set('q', opts.q);
    if (opts.labelIds) {
      for (const id of opts.labelIds) params.append('labelIds', id);
    }
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.includeSpamTrash) params.set('includeSpamTrash', 'true');
    const qs = params.toString();
    return this.request(`/users/me/messages${qs ? `?${qs}` : ''}`) as Promise<MessageList>;
  }

  async getMessage(opts: {
    id: string;
    format?: string;
    metadataHeaders?: string[];
  }): Promise<Message> {
    const params = new URLSearchParams();
    if (opts.format) params.set('format', opts.format);
    if (opts.metadataHeaders) {
      for (const h of opts.metadataHeaders) params.append('metadataHeaders', h);
    }
    const qs = params.toString();
    return this.request(`/users/me/messages/${opts.id}${qs ? `?${qs}` : ''}`) as Promise<Message>;
  }

  async sendMessage(opts: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    html?: string;
    in_reply_to?: string;
    references?: string;
    thread_id?: string;
  }): Promise<Message> {
    const raw = this.buildRawMessage(opts);
    const payload: Record<string, unknown> = { raw };
    if (opts.thread_id) payload.threadId = opts.thread_id;
    return this.request('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<Message>;
  }

  async deleteMessage(opts: { id: string }): Promise<void> {
    await this.request(`/users/me/messages/${opts.id}`, {
      method: 'DELETE',
    });
  }

  async trashMessage(opts: { id: string }): Promise<Message> {
    return this.request(`/users/me/messages/${opts.id}/trash`, {
      method: 'POST',
    }) as Promise<Message>;
  }

  async untrashMessage(opts: { id: string }): Promise<Message> {
    return this.request(`/users/me/messages/${opts.id}/untrash`, {
      method: 'POST',
    }) as Promise<Message>;
  }

  async modifyMessage(opts: {
    id: string;
    addLabelIds?: string[];
    removeLabelIds?: string[];
  }): Promise<Message> {
    return this.request(`/users/me/messages/${opts.id}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: opts.addLabelIds || [],
        removeLabelIds: opts.removeLabelIds || [],
      }),
    }) as Promise<Message>;
  }

  async batchDeleteMessages(opts: { ids: string[] }): Promise<void> {
    await this.request('/users/me/messages/batchDelete', {
      method: 'POST',
      body: JSON.stringify({ ids: opts.ids }),
    });
  }

  async batchModifyMessages(opts: {
    ids: string[];
    addLabelIds?: string[];
    removeLabelIds?: string[];
  }): Promise<void> {
    await this.request('/users/me/messages/batchModify', {
      method: 'POST',
      body: JSON.stringify({
        ids: opts.ids,
        addLabelIds: opts.addLabelIds || [],
        removeLabelIds: opts.removeLabelIds || [],
      }),
    });
  }

  async getAttachment(opts: {
    messageId: string;
    attachmentId: string;
  }): Promise<Attachment> {
    return this.request(
      `/users/me/messages/${opts.messageId}/attachments/${opts.attachmentId}`
    ) as Promise<Attachment>;
  }

  // ========== Drafts (6) ==========

  async listDrafts(opts: {
    maxResults?: number;
    pageToken?: string;
    q?: string;
  }): Promise<DraftList> {
    const params = new URLSearchParams();
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.q) params.set('q', opts.q);
    const qs = params.toString();
    return this.request(`/users/me/drafts${qs ? `?${qs}` : ''}`) as Promise<DraftList>;
  }

  async getDraft(opts: {
    id: string;
    format?: string;
  }): Promise<Draft> {
    const params = new URLSearchParams();
    if (opts.format) params.set('format', opts.format);
    const qs = params.toString();
    return this.request(`/users/me/drafts/${opts.id}${qs ? `?${qs}` : ''}`) as Promise<Draft>;
  }

  async createDraft(opts: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    html?: string;
    thread_id?: string;
  }): Promise<Draft> {
    const raw = this.buildRawMessage(opts);
    const message: Record<string, unknown> = { raw };
    if (opts.thread_id) message.threadId = opts.thread_id;
    return this.request('/users/me/drafts', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }) as Promise<Draft>;
  }

  async updateDraft(opts: {
    id: string;
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    html?: string;
    thread_id?: string;
  }): Promise<Draft> {
    const raw = this.buildRawMessage(opts);
    const message: Record<string, unknown> = { raw };
    if (opts.thread_id) message.threadId = opts.thread_id;
    return this.request(`/users/me/drafts/${opts.id}`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    }) as Promise<Draft>;
  }

  async deleteDraft(opts: { id: string }): Promise<void> {
    await this.request(`/users/me/drafts/${opts.id}`, {
      method: 'DELETE',
    });
  }

  async sendDraft(opts: { id: string }): Promise<Message> {
    return this.request('/users/me/drafts/send', {
      method: 'POST',
      body: JSON.stringify({ id: opts.id }),
    }) as Promise<Message>;
  }

  // ========== Labels (5) ==========

  async listLabels(): Promise<LabelList> {
    return this.request('/users/me/labels') as Promise<LabelList>;
  }

  async getLabel(opts: { id: string }): Promise<Label> {
    return this.request(`/users/me/labels/${opts.id}`) as Promise<Label>;
  }

  async createLabel(opts: {
    name: string;
    messageListVisibility?: string;
    labelListVisibility?: string;
    backgroundColor?: string;
    textColor?: string;
  }): Promise<Label> {
    const payload: Record<string, unknown> = { name: opts.name };
    if (opts.messageListVisibility) payload.messageListVisibility = opts.messageListVisibility;
    if (opts.labelListVisibility) payload.labelListVisibility = opts.labelListVisibility;
    if (opts.backgroundColor || opts.textColor) {
      payload.color = {
        backgroundColor: opts.backgroundColor,
        textColor: opts.textColor,
      };
    }
    return this.request('/users/me/labels', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<Label>;
  }

  async updateLabel(opts: {
    id: string;
    name?: string;
    messageListVisibility?: string;
    labelListVisibility?: string;
    backgroundColor?: string;
    textColor?: string;
  }): Promise<Label> {
    const payload: Record<string, unknown> = { id: opts.id };
    if (opts.name) payload.name = opts.name;
    if (opts.messageListVisibility) payload.messageListVisibility = opts.messageListVisibility;
    if (opts.labelListVisibility) payload.labelListVisibility = opts.labelListVisibility;
    if (opts.backgroundColor || opts.textColor) {
      payload.color = {
        backgroundColor: opts.backgroundColor,
        textColor: opts.textColor,
      };
    }
    return this.request(`/users/me/labels/${opts.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<Label>;
  }

  async deleteLabel(opts: { id: string }): Promise<void> {
    await this.request(`/users/me/labels/${opts.id}`, {
      method: 'DELETE',
    });
  }

  // ========== Threads (5) ==========

  async listThreads(opts: {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
    includeSpamTrash?: boolean;
  }): Promise<ThreadList> {
    const params = new URLSearchParams();
    if (opts.q) params.set('q', opts.q);
    if (opts.labelIds) {
      for (const id of opts.labelIds) params.append('labelIds', id);
    }
    if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
    if (opts.pageToken) params.set('pageToken', opts.pageToken);
    if (opts.includeSpamTrash) params.set('includeSpamTrash', 'true');
    const qs = params.toString();
    return this.request(`/users/me/threads${qs ? `?${qs}` : ''}`) as Promise<ThreadList>;
  }

  async getThread(opts: {
    id: string;
    format?: string;
  }): Promise<Thread> {
    const params = new URLSearchParams();
    if (opts.format) params.set('format', opts.format);
    const qs = params.toString();
    return this.request(`/users/me/threads/${opts.id}${qs ? `?${qs}` : ''}`) as Promise<Thread>;
  }

  async modifyThread(opts: {
    id: string;
    addLabelIds?: string[];
    removeLabelIds?: string[];
  }): Promise<Thread> {
    return this.request(`/users/me/threads/${opts.id}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: opts.addLabelIds || [],
        removeLabelIds: opts.removeLabelIds || [],
      }),
    }) as Promise<Thread>;
  }

  async trashThread(opts: { id: string }): Promise<Thread> {
    return this.request(`/users/me/threads/${opts.id}/trash`, {
      method: 'POST',
    }) as Promise<Thread>;
  }

  async untrashThread(opts: { id: string }): Promise<Thread> {
    return this.request(`/users/me/threads/${opts.id}/untrash`, {
      method: 'POST',
    }) as Promise<Thread>;
  }

  // ========== Settings (2) ==========

  async getProfile(): Promise<Profile> {
    return this.request('/users/me/profile') as Promise<Profile>;
  }

  async updateVacation(opts: {
    enableAutoReply: boolean;
    responseSubject?: string;
    responseBodyPlainText?: string;
    responseBodyHtml?: string;
    restrictToContacts?: boolean;
    restrictToDomain?: boolean;
    startTime?: string;
    endTime?: string;
  }): Promise<VacationSettings> {
    return this.request('/users/me/settings/vacation', {
      method: 'PUT',
      body: JSON.stringify({
        enableAutoReply: opts.enableAutoReply,
        responseSubject: opts.responseSubject,
        responseBodyPlainText: opts.responseBodyPlainText,
        responseBodyHtml: opts.responseBodyHtml,
        restrictToContacts: opts.restrictToContacts,
        restrictToDomain: opts.restrictToDomain,
        startTime: opts.startTime,
        endTime: opts.endTime,
      }),
    }) as Promise<VacationSettings>;
  }
}
