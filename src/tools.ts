/**
 * 28 Gmail MCP Tool Definitions
 */

import type { MCPToolDefinition } from './types.js';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Messages (10) ==========
  {
    name: 'gmail_list_messages',
    description: 'List messages in the mailbox. Supports Gmail search syntax for filtering (e.g., from:, to:, subject:, is:unread, has:attachment).',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Gmail search query (e.g., "from:user@example.com is:unread", "subject:meeting has:attachment", "after:2026/01/01")' },
        label_ids: {
          type: 'array',
          description: 'Filter by label IDs (e.g., ["INBOX"], ["UNREAD"]). System labels: INBOX, SENT, DRAFT, SPAM, TRASH, UNREAD, STARRED, IMPORTANT',
          items: { type: 'string' },
        },
        max_results: { type: 'number', description: 'Maximum number of messages to return (default: 100, max: 500)' },
        page_token: { type: 'string', description: 'Token for next page of results (from previous response nextPageToken)' },
        include_spam_trash: { type: 'boolean', description: 'Include messages from SPAM and TRASH (default: false)' },
      },
    },
    annotations: { title: 'List Messages', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_get_message',
    description: 'Get a specific message by ID. Returns headers, body, labels, and metadata. Use format=full for parsed body or format=raw for RFC 2822.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The message ID (from gmail_list_messages)' },
        format: {
          type: 'string',
          description: 'Response format: full (parsed body), metadata (headers only), minimal (IDs and labels), raw (RFC 2822 base64url)',
          enum: ['full', 'metadata', 'minimal', 'raw'],
        },
        metadata_headers: {
          type: 'array',
          description: 'Specific headers to include when format=metadata (e.g., ["From", "To", "Subject", "Date"])',
          items: { type: 'string' },
        },
      },
      required: ['id'],
    },
    annotations: { title: 'Get Message', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_send_message',
    description: 'Send an email message. Supports plain text and HTML body, CC, BCC, and replying to threads.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address(es), comma-separated for multiple' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Plain text body of the email' },
        cc: { type: 'string', description: 'CC recipient(s), comma-separated' },
        bcc: { type: 'string', description: 'BCC recipient(s), comma-separated' },
        html: { type: 'string', description: 'HTML body (sent as multipart/alternative with plain text)' },
        in_reply_to: { type: 'string', description: 'Message-ID header of the message being replied to' },
        references: { type: 'string', description: 'References header for threading (space-separated Message-IDs)' },
        thread_id: { type: 'string', description: 'Thread ID to add this message to (for replies)' },
      },
      required: ['to', 'subject', 'body'],
    },
    annotations: { title: 'Send Message', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gmail_delete_message',
    description: 'Permanently delete a message. This action is irreversible — use gmail_trash_message for safe deletion.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The message ID to permanently delete' },
      },
      required: ['id'],
    },
    annotations: { title: 'Delete Message', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_trash_message',
    description: 'Move a message to the trash. Can be undone with gmail_untrash_message.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The message ID to move to trash' },
      },
      required: ['id'],
    },
    annotations: { title: 'Trash Message', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_untrash_message',
    description: 'Remove a message from the trash, restoring it to its original location.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The message ID to remove from trash' },
      },
      required: ['id'],
    },
    annotations: { title: 'Untrash Message', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_modify_message',
    description: 'Add or remove labels on a message. Use this to mark as read/unread, star/unstar, or apply custom labels.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The message ID to modify' },
        add_label_ids: {
          type: 'array',
          description: 'Label IDs to add (e.g., ["STARRED", "IMPORTANT"] or custom label IDs)',
          items: { type: 'string' },
        },
        remove_label_ids: {
          type: 'array',
          description: 'Label IDs to remove (e.g., ["UNREAD"] to mark as read)',
          items: { type: 'string' },
        },
      },
      required: ['id'],
    },
    annotations: { title: 'Modify Message Labels', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_batch_delete',
    description: 'Permanently delete multiple messages at once. Maximum 1000 IDs per request. Irreversible.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          description: 'Array of message IDs to permanently delete (max 1000)',
          items: { type: 'string' },
        },
      },
      required: ['ids'],
    },
    annotations: { title: 'Batch Delete Messages', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_batch_modify',
    description: 'Add or remove labels on multiple messages at once. Maximum 1000 IDs per request.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          description: 'Array of message IDs to modify (max 1000)',
          items: { type: 'string' },
        },
        add_label_ids: {
          type: 'array',
          description: 'Label IDs to add to all specified messages',
          items: { type: 'string' },
        },
        remove_label_ids: {
          type: 'array',
          description: 'Label IDs to remove from all specified messages',
          items: { type: 'string' },
        },
      },
      required: ['ids'],
    },
    annotations: { title: 'Batch Modify Messages', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_get_attachment',
    description: 'Get attachment data for a message. Returns base64url-encoded data. Find attachment IDs in the message payload parts.',
    inputSchema: {
      type: 'object',
      properties: {
        message_id: { type: 'string', description: 'The message ID containing the attachment' },
        attachment_id: { type: 'string', description: 'The attachment ID (from message payload.parts[].body.attachmentId)' },
      },
      required: ['message_id', 'attachment_id'],
    },
    annotations: { title: 'Get Attachment', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Drafts (6) ==========
  {
    name: 'gmail_list_drafts',
    description: 'List all drafts in the mailbox.',
    inputSchema: {
      type: 'object',
      properties: {
        max_results: { type: 'number', description: 'Maximum number of drafts to return (default: 100, max: 500)' },
        page_token: { type: 'string', description: 'Token for next page of results' },
        q: { type: 'string', description: 'Gmail search query to filter drafts' },
      },
    },
    annotations: { title: 'List Drafts', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_get_draft',
    description: 'Get a specific draft by ID, including the draft message content.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The draft ID (from gmail_list_drafts)' },
        format: {
          type: 'string',
          description: 'Response format for the draft message',
          enum: ['full', 'metadata', 'minimal', 'raw'],
        },
      },
      required: ['id'],
    },
    annotations: { title: 'Get Draft', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_create_draft',
    description: 'Create a new draft email. The draft can be sent later with gmail_send_draft.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address(es), comma-separated' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Plain text body' },
        cc: { type: 'string', description: 'CC recipient(s), comma-separated' },
        bcc: { type: 'string', description: 'BCC recipient(s), comma-separated' },
        html: { type: 'string', description: 'HTML body (sent as multipart/alternative with plain text)' },
        thread_id: { type: 'string', description: 'Thread ID to associate this draft with (for reply drafts)' },
      },
      required: ['to', 'subject', 'body'],
    },
    annotations: { title: 'Create Draft', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gmail_update_draft',
    description: 'Update an existing draft with new content. Replaces the entire draft message.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The draft ID to update' },
        to: { type: 'string', description: 'Recipient email address(es), comma-separated' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Plain text body' },
        cc: { type: 'string', description: 'CC recipient(s), comma-separated' },
        bcc: { type: 'string', description: 'BCC recipient(s), comma-separated' },
        html: { type: 'string', description: 'HTML body (sent as multipart/alternative with plain text)' },
        thread_id: { type: 'string', description: 'Thread ID to associate this draft with' },
      },
      required: ['id', 'to', 'subject', 'body'],
    },
    annotations: { title: 'Update Draft', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_delete_draft',
    description: 'Delete a draft. This permanently removes the draft.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The draft ID to delete' },
      },
      required: ['id'],
    },
    annotations: { title: 'Delete Draft', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_send_draft',
    description: 'Send an existing draft. The draft is removed from the drafts list after sending.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The draft ID to send' },
      },
      required: ['id'],
    },
    annotations: { title: 'Send Draft', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },

  // ========== Labels (5) ==========
  {
    name: 'gmail_list_labels',
    description: 'List all labels in the mailbox, including system labels (INBOX, SENT, etc.) and user-created labels.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: { title: 'List Labels', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_get_label',
    description: 'Get details for a specific label, including message and thread counts.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The label ID (from gmail_list_labels, e.g., "INBOX", "Label_1")' },
      },
      required: ['id'],
    },
    annotations: { title: 'Get Label', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_create_label',
    description: 'Create a new user label for organizing messages.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Label name (use "/" for nested labels, e.g., "Projects/Active")' },
        message_list_visibility: {
          type: 'string',
          description: 'Whether messages with this label show in the message list',
          enum: ['show', 'hide'],
        },
        label_list_visibility: {
          type: 'string',
          description: 'Whether this label shows in the label list',
          enum: ['labelShow', 'labelShowIfUnread', 'labelHide'],
        },
        background_color: { type: 'string', description: 'Background color hex (e.g., "#16a765")' },
        text_color: { type: 'string', description: 'Text color hex (e.g., "#ffffff")' },
      },
      required: ['name'],
    },
    annotations: { title: 'Create Label', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gmail_update_label',
    description: 'Update a label name, visibility, or color.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The label ID to update' },
        name: { type: 'string', description: 'New label name' },
        message_list_visibility: {
          type: 'string',
          description: 'Whether messages with this label show in the message list',
          enum: ['show', 'hide'],
        },
        label_list_visibility: {
          type: 'string',
          description: 'Whether this label shows in the label list',
          enum: ['labelShow', 'labelShowIfUnread', 'labelHide'],
        },
        background_color: { type: 'string', description: 'Background color hex (e.g., "#16a765")' },
        text_color: { type: 'string', description: 'Text color hex (e.g., "#ffffff")' },
      },
      required: ['id'],
    },
    annotations: { title: 'Update Label', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_delete_label',
    description: 'Delete a user-created label. System labels cannot be deleted. Messages with this label are not deleted.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The label ID to delete (must be a user-created label)' },
      },
      required: ['id'],
    },
    annotations: { title: 'Delete Label', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },

  // ========== Threads (5) ==========
  {
    name: 'gmail_list_threads',
    description: 'List email threads (conversations). Supports the same search syntax as gmail_list_messages.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Gmail search query (e.g., "from:user@example.com", "subject:meeting is:unread")' },
        label_ids: {
          type: 'array',
          description: 'Filter by label IDs (e.g., ["INBOX"])',
          items: { type: 'string' },
        },
        max_results: { type: 'number', description: 'Maximum number of threads to return (default: 100, max: 500)' },
        page_token: { type: 'string', description: 'Token for next page of results' },
        include_spam_trash: { type: 'boolean', description: 'Include threads from SPAM and TRASH (default: false)' },
      },
    },
    annotations: { title: 'List Threads', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_get_thread',
    description: 'Get all messages in a thread (conversation). Returns the complete email chain.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The thread ID (from gmail_list_threads or message.threadId)' },
        format: {
          type: 'string',
          description: 'Response format for thread messages',
          enum: ['full', 'metadata', 'minimal'],
        },
      },
      required: ['id'],
    },
    annotations: { title: 'Get Thread', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_modify_thread',
    description: 'Add or remove labels on all messages in a thread.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The thread ID to modify' },
        add_label_ids: {
          type: 'array',
          description: 'Label IDs to add to all messages in the thread',
          items: { type: 'string' },
        },
        remove_label_ids: {
          type: 'array',
          description: 'Label IDs to remove from all messages in the thread',
          items: { type: 'string' },
        },
      },
      required: ['id'],
    },
    annotations: { title: 'Modify Thread Labels', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_trash_thread',
    description: 'Move all messages in a thread to the trash.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The thread ID to move to trash' },
      },
      required: ['id'],
    },
    annotations: { title: 'Trash Thread', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_untrash_thread',
    description: 'Remove all messages in a thread from the trash.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The thread ID to remove from trash' },
      },
      required: ['id'],
    },
    annotations: { title: 'Untrash Thread', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Settings (2) ==========
  {
    name: 'gmail_get_profile',
    description: 'Get the authenticated user\'s Gmail profile — email address, total message count, total thread count, and history ID.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: { title: 'Get Profile', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gmail_update_vacation',
    description: 'Enable or disable vacation auto-reply (out of office) with custom response message.',
    inputSchema: {
      type: 'object',
      properties: {
        enable_auto_reply: { type: 'boolean', description: 'Whether to enable the vacation auto-reply' },
        response_subject: { type: 'string', description: 'Subject line for the auto-reply (optional, uses original subject if omitted)' },
        response_body_plain_text: { type: 'string', description: 'Plain text body for the auto-reply' },
        response_body_html: { type: 'string', description: 'HTML body for the auto-reply' },
        restrict_to_contacts: { type: 'boolean', description: 'Only send auto-reply to people in contacts (default: false)' },
        restrict_to_domain: { type: 'boolean', description: 'Only send auto-reply to same domain (default: false)' },
        start_time: { type: 'string', description: 'Start time in epoch milliseconds (e.g., "1704067200000"). Omit for immediate start' },
        end_time: { type: 'string', description: 'End time in epoch milliseconds. Omit for no end date' },
      },
      required: ['enable_auto_reply'],
    },
    annotations: { title: 'Update Vacation Settings', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
];
