# Space & Template JSON Schema

All Spaces and Templates are serialized as structured JSON. Templates use the `.space` file extension.

---

## Space Schema

```typescript
interface Space {
  // Identity
  id: string;               // UUID v4
  name: string;
  description?: string;
  icon?: string;            // Emoji or URL to custom icon
  color?: string;           // Accent color hex for sidebar/header
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601

  // Template provenance
  templateId?: string;      // If spawned from a template
  templateVersion?: string; // Template version at time of spawn

  // AI Configuration
  aiProfile: AIDirectionProfile;
  customInstructions?: string; // User-written system prompt addendum

  // Sources
  files: FileManifestEntry[];
  sourceLinkBundle: SourceLinkBundle;

  // Threads
  threadIds: string[];

  // Sync
  githubRef?: GitHubRef;
}
```

---

## Template Schema

Templates are Spaces without thread history, plus template-specific metadata.

```typescript
interface SpaceTemplate {
  // Template identity
  templateId: string;       // UUID v4
  version: string;          // Semver: "1.0.0"
  name: string;
  description: string;
  tags: string[];           // e.g. ["research", "coding", "writing"]
  author: string;           // GitHub username or display name
  thumbnail?: string;       // Base64 PNG or URL
  createdAt: string;
  updatedAt: string;

  // Space config (same as Space, minus threads)
  icon?: string;
  color?: string;
  aiProfile: AIDirectionProfile;
  customInstructions?: string;

  // Files — can be embedded or referenced
  files: TemplateFileEntry[];

  // Sources
  sourceLinkBundle: SourceLinkBundle;

  // Schema version for forward-compat
  schemaVersion: "1";
}

interface TemplateFileEntry {
  name: string;
  type: string;             // MIME type
  sizeBytes: number;
  // One of:
  content?: string;         // Base64-encoded file content (for small files)
  url?: string;             // External URL to fetch on instantiation
  // Prompt user to re-upload if neither is present
  requiresUpload?: boolean;
  uploadPrompt?: string;    // Descriptive prompt: "Upload your project brief (PDF)"
}
```

---

## AI Direction Profile Schema

```typescript
interface AIDirectionProfile {
  id: string;
  name: string;             // e.g. "Research Analyst", "Creative Writer"
  model: SupportedModel;
  reasoningMode: "focused" | "analytical" | "creative" | "strict";
  responseLengthPreference: "concise" | "balanced" | "detailed";
  citationBehavior: "always" | "when-relevant" | "never";
  temperature?: number;     // 0.0 – 1.0, optional override
  systemPromptPrefix?: string; // Injected before custom instructions
}

type SupportedModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3-5-sonnet"
  | "claude-3-haiku"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash"
  | "llama-3.1-70b"
  | "custom";              // User-provided endpoint
```

---

## Source Link Bundle Schema

```typescript
interface SourceLinkBundle {
  id: string;
  name?: string;            // e.g. "Vercel Docs", "My Research Sources"
  urls: SourceURL[];
  domainScopes: string[];   // e.g. ["docs.react.dev", "*.vercel.com"]
  searchMode: "within-sources" | "sources-preferred" | "web-wide";
}

interface SourceURL {
  url: string;
  title?: string;
  cachedAt?: string;        // ISO 8601 — when it was last scraped
  includeInContext: boolean; // Whether to inject content into context
}
```

---

## .space File Format

A `.space` file is a self-contained JSON bundle (optionally gzip-compressed) that represents a SpaceTemplate:

```json
{
  "schemaVersion": "1",
  "templateId": "a1b2c3d4-...",
  "version": "1.0.0",
  "name": "Product Research Assistant",
  "description": "A Space pre-loaded with research frameworks, citation discipline, and product analysis sources.",
  "tags": ["research", "product", "analysis"],
  "author": "nothinginfinity",
  "createdAt": "2026-04-28T00:00:00Z",
  "updatedAt": "2026-04-28T00:00:00Z",
  "aiProfile": {
    "id": "research-analyst",
    "name": "Research Analyst",
    "model": "claude-3-5-sonnet",
    "reasoningMode": "analytical",
    "responseLengthPreference": "detailed",
    "citationBehavior": "always"
  },
  "customInstructions": "You are a rigorous research assistant. Always cite primary sources. When uncertain, say so explicitly. Structure outputs with headers.",
  "files": [
    {
      "name": "research-framework.pdf",
      "type": "application/pdf",
      "sizeBytes": 245000,
      "requiresUpload": true,
      "uploadPrompt": "Upload your research framework or methodology document (PDF)"
    }
  ],
  "sourceLinkBundle": {
    "id": "s-001",
    "name": "Research Sources",
    "urls": [
      { "url": "https://hbr.org", "title": "Harvard Business Review", "includeInContext": false },
      { "url": "https://www.mckinsey.com/insights", "title": "McKinsey Insights", "includeInContext": false }
    ],
    "domainScopes": ["hbr.org", "mckinsey.com", "bcg.com"],
    "searchMode": "sources-preferred"
  }
}
```
