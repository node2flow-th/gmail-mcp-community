/**
 * Shared MCP Server — used by both Node.js (index.ts) and CF Worker (worker.ts)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { GmailClient } from './gmail-client.js';
import { TOOLS } from './tools.js';

export interface GmailMcpConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export function handleToolCall(
  toolName: string,
  args: Record<string, unknown>,
  client: GmailClient
) {
  switch (toolName) {
    // ========== Messages ==========
    case 'gmail_list_messages':
      return client.listMessages({
        q: args.q as string | undefined,
        labelIds: args.label_ids as string[] | undefined,
        maxResults: args.max_results as number | undefined,
        pageToken: args.page_token as string | undefined,
        includeSpamTrash: args.include_spam_trash as boolean | undefined,
      });
    case 'gmail_get_message':
      return client.getMessage({
        id: args.id as string,
        format: args.format as string | undefined,
        metadataHeaders: args.metadata_headers as string[] | undefined,
      });
    case 'gmail_send_message':
      return client.sendMessage({
        to: args.to as string,
        subject: args.subject as string,
        body: args.body as string,
        cc: args.cc as string | undefined,
        bcc: args.bcc as string | undefined,
        html: args.html as string | undefined,
        in_reply_to: args.in_reply_to as string | undefined,
        references: args.references as string | undefined,
        thread_id: args.thread_id as string | undefined,
      });
    case 'gmail_delete_message':
      return client.deleteMessage({ id: args.id as string });
    case 'gmail_trash_message':
      return client.trashMessage({ id: args.id as string });
    case 'gmail_untrash_message':
      return client.untrashMessage({ id: args.id as string });
    case 'gmail_modify_message':
      return client.modifyMessage({
        id: args.id as string,
        addLabelIds: args.add_label_ids as string[] | undefined,
        removeLabelIds: args.remove_label_ids as string[] | undefined,
      });
    case 'gmail_batch_delete':
      return client.batchDeleteMessages({
        ids: args.ids as string[],
      });
    case 'gmail_batch_modify':
      return client.batchModifyMessages({
        ids: args.ids as string[],
        addLabelIds: args.add_label_ids as string[] | undefined,
        removeLabelIds: args.remove_label_ids as string[] | undefined,
      });
    case 'gmail_get_attachment':
      return client.getAttachment({
        messageId: args.message_id as string,
        attachmentId: args.attachment_id as string,
      });

    // ========== Drafts ==========
    case 'gmail_list_drafts':
      return client.listDrafts({
        maxResults: args.max_results as number | undefined,
        pageToken: args.page_token as string | undefined,
        q: args.q as string | undefined,
      });
    case 'gmail_get_draft':
      return client.getDraft({
        id: args.id as string,
        format: args.format as string | undefined,
      });
    case 'gmail_create_draft':
      return client.createDraft({
        to: args.to as string,
        subject: args.subject as string,
        body: args.body as string,
        cc: args.cc as string | undefined,
        bcc: args.bcc as string | undefined,
        html: args.html as string | undefined,
        thread_id: args.thread_id as string | undefined,
      });
    case 'gmail_update_draft':
      return client.updateDraft({
        id: args.id as string,
        to: args.to as string,
        subject: args.subject as string,
        body: args.body as string,
        cc: args.cc as string | undefined,
        bcc: args.bcc as string | undefined,
        html: args.html as string | undefined,
        thread_id: args.thread_id as string | undefined,
      });
    case 'gmail_delete_draft':
      return client.deleteDraft({ id: args.id as string });
    case 'gmail_send_draft':
      return client.sendDraft({ id: args.id as string });

    // ========== Labels ==========
    case 'gmail_list_labels':
      return client.listLabels();
    case 'gmail_get_label':
      return client.getLabel({ id: args.id as string });
    case 'gmail_create_label':
      return client.createLabel({
        name: args.name as string,
        messageListVisibility: args.message_list_visibility as string | undefined,
        labelListVisibility: args.label_list_visibility as string | undefined,
        backgroundColor: args.background_color as string | undefined,
        textColor: args.text_color as string | undefined,
      });
    case 'gmail_update_label':
      return client.updateLabel({
        id: args.id as string,
        name: args.name as string | undefined,
        messageListVisibility: args.message_list_visibility as string | undefined,
        labelListVisibility: args.label_list_visibility as string | undefined,
        backgroundColor: args.background_color as string | undefined,
        textColor: args.text_color as string | undefined,
      });
    case 'gmail_delete_label':
      return client.deleteLabel({ id: args.id as string });

    // ========== Threads ==========
    case 'gmail_list_threads':
      return client.listThreads({
        q: args.q as string | undefined,
        labelIds: args.label_ids as string[] | undefined,
        maxResults: args.max_results as number | undefined,
        pageToken: args.page_token as string | undefined,
        includeSpamTrash: args.include_spam_trash as boolean | undefined,
      });
    case 'gmail_get_thread':
      return client.getThread({
        id: args.id as string,
        format: args.format as string | undefined,
      });
    case 'gmail_modify_thread':
      return client.modifyThread({
        id: args.id as string,
        addLabelIds: args.add_label_ids as string[] | undefined,
        removeLabelIds: args.remove_label_ids as string[] | undefined,
      });
    case 'gmail_trash_thread':
      return client.trashThread({ id: args.id as string });
    case 'gmail_untrash_thread':
      return client.untrashThread({ id: args.id as string });

    // ========== Settings ==========
    case 'gmail_get_profile':
      return client.getProfile();
    case 'gmail_update_vacation':
      return client.updateVacation({
        enableAutoReply: args.enable_auto_reply as boolean,
        responseSubject: args.response_subject as string | undefined,
        responseBodyPlainText: args.response_body_plain_text as string | undefined,
        responseBodyHtml: args.response_body_html as string | undefined,
        restrictToContacts: args.restrict_to_contacts as boolean | undefined,
        restrictToDomain: args.restrict_to_domain as boolean | undefined,
        startTime: args.start_time as string | undefined,
        endTime: args.end_time as string | undefined,
      });

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function createServer(config?: GmailMcpConfig) {
  const server = new McpServer({
    name: 'gmail-mcp',
    version: '1.0.0',
  });

  let client: GmailClient | null = null;

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        annotations: tool.annotations,
      },
      async (args: Record<string, unknown>) => {
        const clientId =
          config?.clientId ||
          (args as Record<string, unknown>).GOOGLE_CLIENT_ID as string;
        const clientSecret =
          config?.clientSecret ||
          (args as Record<string, unknown>).GOOGLE_CLIENT_SECRET as string;
        const refreshToken =
          config?.refreshToken ||
          (args as Record<string, unknown>).GOOGLE_REFRESH_TOKEN as string;

        if (!clientId || !clientSecret || !refreshToken) {
          return {
            content: [{ type: 'text' as const, text: 'Error: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are all required.' }],
            isError: true,
          };
        }

        if (!client || config?.clientId !== clientId) {
          client = new GmailClient({ clientId, clientSecret, refreshToken });
        }

        try {
          const result = await handleToolCall(tool.name, args, client);
          const text = result === undefined ? '{"success": true}' : JSON.stringify(result, null, 2);
          return {
            content: [{ type: 'text' as const, text }],
            isError: false,
          };
        } catch (error) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          };
        }
      }
    );
  }

  // Register prompts
  server.prompt(
    'compose-and-send',
    'Guide for composing and sending emails, managing drafts',
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are a Gmail email assistant.',
            '',
            'Sending emails:',
            '1. **Send directly** — gmail_send_message with to, subject, body',
            '2. **HTML emails** — Include html parameter for rich formatting',
            '3. **Reply to thread** — Set thread_id, in_reply_to (Message-ID header), and references',
            '4. **CC/BCC** — Comma-separate multiple addresses',
            '',
            'Working with drafts:',
            '1. **Create draft** — gmail_create_draft (same params as send)',
            '2. **Update draft** — gmail_update_draft replaces the entire draft',
            '3. **Send draft** — gmail_send_draft with the draft ID',
            '4. **List drafts** — gmail_list_drafts to see all drafts',
            '',
            'Tips:',
            '- For replies, always get the original message first to extract Message-ID and thread_id',
            '- Use gmail_get_thread to see the full conversation before replying',
            '- HTML body is sent alongside plain text as multipart/alternative',
          ].join('\n'),
        },
      }],
    }),
  );

  server.prompt(
    'search-and-organize',
    'Guide for searching emails, managing labels, and organizing the mailbox',
    async () => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: [
            'You are a Gmail organization assistant.',
            '',
            'Search syntax (q parameter):',
            '- from:user@example.com — Messages from a sender',
            '- to:user@example.com — Messages to a recipient',
            '- subject:"meeting notes" — Subject contains text',
            '- has:attachment — Messages with attachments',
            '- is:unread / is:starred / is:important',
            '- label:custom-label — Messages with a specific label',
            '- after:2026/01/01 / before:2026/12/31 — Date range',
            '- newer_than:2d / older_than:1y — Relative dates',
            '- filename:pdf — Attachments by type',
            '- Combine: "from:boss@company.com has:attachment is:unread"',
            '',
            'Organizing with labels:',
            '1. **List labels** — gmail_list_labels to see all labels',
            '2. **Create label** — gmail_create_label with nested support ("Projects/Active")',
            '3. **Apply labels** — gmail_modify_message to add/remove labels',
            '4. **Mark as read** — Remove "UNREAD" label',
            '5. **Star message** — Add "STARRED" label',
            '6. **Batch operations** — gmail_batch_modify for bulk label changes',
            '',
            'System labels: INBOX, SENT, DRAFT, SPAM, TRASH, UNREAD, STARRED, IMPORTANT, CATEGORY_PERSONAL, CATEGORY_SOCIAL, CATEGORY_PROMOTIONS, CATEGORY_UPDATES, CATEGORY_FORUMS',
          ].join('\n'),
        },
      }],
    }),
  );

  // Register resource
  server.resource(
    'server-info',
    'gmail://server-info',
    {
      description: 'Connection status and available tools for this Gmail MCP server',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [{
        uri: 'gmail://server-info',
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'gmail-mcp',
          version: '1.0.0',
          connected: !!config,
          has_oauth: !!(config?.clientId),
          tools_available: TOOLS.length,
          tool_categories: {
            messages: 10,
            drafts: 6,
            labels: 5,
            threads: 5,
            settings: 2,
          },
        }, null, 2),
      }],
    }),
  );

  // Override tools/list handler to return raw JSON Schema with property descriptions
  (server as any).server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS.map(tool => {
      const hasProperties = Object.keys(tool.inputSchema.properties).length > 0;
      return {
        name: tool.name,
        description: tool.description,
        ...(hasProperties ? { inputSchema: tool.inputSchema } : {}),
        annotations: tool.annotations,
      };
    }),
  }));

  return server;
}
