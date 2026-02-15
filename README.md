# @node2flow/gmail-mcp

[![smithery badge](https://smithery.ai/badge/node2flow/gmail-mcp)](https://smithery.ai/server/node2flow/gmail-mcp)
[![npm version](https://img.shields.io/npm/v/@node2flow/gmail-mcp.svg)](https://www.npmjs.com/package/@node2flow/gmail-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for **Gmail** — send, search, read, organize emails and manage labels through 28 tools via the Model Context Protocol.

## Quick Start

### Claude Desktop / Cursor

Add to your MCP config:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": ["-y", "@node2flow/gmail-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

### HTTP Mode

```bash
GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=xxx GOOGLE_REFRESH_TOKEN=xxx npx @node2flow/gmail-mcp --http
```

MCP endpoint: `http://localhost:3000/mcp`

### Cloudflare Worker

Available at: `https://gmail-mcp-community.node2flow.net/mcp`

```
POST https://gmail-mcp-community.node2flow.net/mcp?GOOGLE_CLIENT_ID=xxx&GOOGLE_CLIENT_SECRET=xxx&GOOGLE_REFRESH_TOKEN=xxx
```

---

## Tools (28)

### Messages (10)

| Tool | Description |
|------|-------------|
| `gmail_list_messages` | List messages with Gmail search syntax |
| `gmail_get_message` | Get message content (full/metadata/minimal/raw) |
| `gmail_send_message` | Send email with to, cc, bcc, subject, body, HTML |
| `gmail_delete_message` | Permanently delete a message |
| `gmail_trash_message` | Move message to trash |
| `gmail_untrash_message` | Remove message from trash |
| `gmail_modify_message` | Add/remove labels on a message |
| `gmail_batch_delete` | Delete multiple messages (up to 1000) |
| `gmail_batch_modify` | Modify labels on multiple messages |
| `gmail_get_attachment` | Get attachment data (base64) |

### Drafts (6)

| Tool | Description |
|------|-------------|
| `gmail_list_drafts` | List all drafts |
| `gmail_get_draft` | Get draft content |
| `gmail_create_draft` | Create a new draft |
| `gmail_update_draft` | Update an existing draft |
| `gmail_delete_draft` | Delete a draft |
| `gmail_send_draft` | Send an existing draft |

### Labels (5)

| Tool | Description |
|------|-------------|
| `gmail_list_labels` | List all labels (system + user) |
| `gmail_get_label` | Get label details with counts |
| `gmail_create_label` | Create a new label with color |
| `gmail_update_label` | Update label name/visibility/color |
| `gmail_delete_label` | Delete a user-created label |

### Threads (5)

| Tool | Description |
|------|-------------|
| `gmail_list_threads` | List threads with search query |
| `gmail_get_thread` | Get all messages in a thread |
| `gmail_modify_thread` | Add/remove labels on a thread |
| `gmail_trash_thread` | Move thread to trash |
| `gmail_untrash_thread` | Remove thread from trash |

### Settings (2)

| Tool | Description |
|------|-------------|
| `gmail_get_profile` | Get email address, message/thread counts |
| `gmail_update_vacation` | Enable/disable vacation auto-reply |

---

## Search Query Syntax

The `q` parameter in `gmail_list_messages` and `gmail_list_threads` supports Gmail search operators:

```
from:user@example.com          — Messages from a sender
to:user@example.com            — Messages to a recipient
subject:"meeting notes"        — Subject contains text
has:attachment                  — Has attachments
filename:pdf                   — Attachment by type
is:unread / is:starred         — Message state
label:custom-label             — By label
after:2026/01/01               — After date
newer_than:2d / older_than:1y  — Relative date
in:inbox / in:sent / in:trash  — By location
```

Combine operators: `from:boss@company.com has:attachment is:unread after:2026/01/01`

---

## Configuration

| Parameter | Required | Description |
|-----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Client Secret |
| `GOOGLE_REFRESH_TOKEN` | Yes | Refresh token (obtained via OAuth consent flow) |

### Getting Your Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Gmail API**
3. Create **OAuth 2.0 Client ID** (Desktop app type)
4. Use the [OAuth Playground](https://developers.google.com/oauthplayground/) or your app to get a refresh token with the Gmail scope

### OAuth Scopes

| Scope | Access |
|-------|--------|
| `gmail.modify` | Read, send, delete, and manage (recommended) |
| `gmail.readonly` | Read-only access |
| `gmail.send` | Send only |
| `gmail.compose` | Create and send drafts |
| `gmail.labels` | Manage labels only |
| `mail.google.com` | Full access including permanent delete |

---

## License

MIT License - see [LICENSE](LICENSE)

Copyright (c) 2026 [Node2Flow](https://node2flow.net)

## Links

- [npm Package](https://www.npmjs.com/package/@node2flow/gmail-mcp)
- [Gmail API](https://developers.google.com/gmail/api)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Node2Flow](https://node2flow.net)
