/**
 * Gmail API v1 Types
 */

// ========== Message ==========

export interface Message {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: MessagePart;
  sizeEstimate?: number;
  raw?: string;
}

export interface MessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: MessagePartHeader[];
  body?: MessagePartBody;
  parts?: MessagePart[];
}

export interface MessagePartHeader {
  name: string;
  value: string;
}

export interface MessagePartBody {
  attachmentId?: string;
  size?: number;
  data?: string;
}

export interface MessageList {
  messages?: MessageRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface MessageRef {
  id: string;
  threadId: string;
}

// ========== Thread ==========

export interface Thread {
  id: string;
  historyId?: string;
  messages?: Message[];
  snippet?: string;
}

export interface ThreadList {
  threads?: ThreadRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface ThreadRef {
  id: string;
  historyId?: string;
  snippet?: string;
}

// ========== Label ==========

export interface Label {
  id: string;
  name: string;
  messageListVisibility?: 'show' | 'hide';
  labelListVisibility?: 'labelShow' | 'labelShowIfUnread' | 'labelHide';
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
  color?: LabelColor;
}

export interface LabelColor {
  textColor?: string;
  backgroundColor?: string;
}

export interface LabelList {
  labels: Label[];
}

// ========== Draft ==========

export interface Draft {
  id: string;
  message?: Message;
}

export interface DraftList {
  drafts?: DraftRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface DraftRef {
  id: string;
  message?: MessageRef;
}

// ========== Profile ==========

export interface Profile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// ========== Vacation Settings ==========

export interface VacationSettings {
  enableAutoReply: boolean;
  responseSubject?: string;
  responseBodyPlainText?: string;
  responseBodyHtml?: string;
  restrictToContacts?: boolean;
  restrictToDomain?: boolean;
  startTime?: string;
  endTime?: string;
}

// ========== History ==========

export interface HistoryList {
  history?: HistoryRecord[];
  nextPageToken?: string;
  historyId: string;
}

export interface HistoryRecord {
  id: string;
  messages?: Message[];
  messagesAdded?: MessageAdded[];
  messagesDeleted?: MessageDeleted[];
  labelsAdded?: LabelModification[];
  labelsRemoved?: LabelModification[];
}

export interface MessageAdded {
  message: Message;
}

export interface MessageDeleted {
  message: Message;
}

export interface LabelModification {
  message: Message;
  labelIds: string[];
}

// ========== Filter ==========

export interface Filter {
  id: string;
  criteria?: FilterCriteria;
  action?: FilterAction;
}

export interface FilterCriteria {
  from?: string;
  to?: string;
  subject?: string;
  query?: string;
  negatedQuery?: string;
  hasAttachment?: boolean;
  excludeChats?: boolean;
  size?: number;
  sizeComparison?: 'larger' | 'smaller';
}

export interface FilterAction {
  addLabelIds?: string[];
  removeLabelIds?: string[];
  forward?: string;
}

export interface FilterList {
  filter: Filter[];
}

// ========== Attachment ==========

export interface Attachment {
  size: number;
  data: string;
}

// ========== Modify Request ==========

export interface ModifyRequest {
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

// ========== Batch Request ==========

export interface BatchDeleteRequest {
  ids: string[];
}

export interface BatchModifyRequest {
  ids: string[];
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

// ========== Tool Definition ==========

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}
