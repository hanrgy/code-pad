# Buildathon Rapid Projects — 5 One-Hour Builds

A compact summary you can drop into prep docs. Each project includes a one-sentence pitch, core scope, stack hints, and the 60-minute path to “demo-able”.

---

## Quick Comparison

| Project | One-liner | Primary Tech Signals | Demo Moment |
|---|---|---|---|
| Real-Time Code Pad + AI | Collaborative editor with an AI coworker | Replit/Next.js, websockets, Claude (Anthropic) | Two browsers co-edit, AI fixes code on click |
| Smart Finance Tracker | CSV → auto categories, budgets, explainers | Claude, MongoDB Atlas or Snowflake | Import file; instant categorized dashboard + LLM summary |
| Company Docs Q&A (Hybrid RAG) | Upload PDFs, ask grounded questions with sources | Qdrant/Vectara, LangChain, Claude | Ask a question; cited snippets appear in UI |
| GraphRAG Incident Map | Build a mini knowledge graph from logs, answer “why” | Neo4j, Snowflake, Claude | Show graph; click nodes → root-cause answer |
| Agentic ETL Copilot | CSV → schema proposal → load → validate | Claude (MCP/agents), MongoDB/Snowflake | Agent proposes schema, loads rows, reports errors |

---

## 1) Real-Time Multiplayer Code Pad (with AI Coworker)

**Pitch:** A minimal collaborative code editor with live cursors and a “Fix/Refactor” button powered by an LLM.

**Core Scope (MVP):**
- Shared document (rooms), live cursor/selection.
- AI action: “Refactor / Explain / Add tests” for current buffer.
- Basic auth by room token; ephemeral storage.

**Suggested Stack:**
- Frontend: Next.js (or Replit starter), websockets (Socket.IO / WS).
- AI: Anthropic Claude API for code-aware prompts.
- Hosting: Replit Deploy for instant URL.

**60-Minute Path:**
1. Scaffold Next.js page + simple editor (Monaco/CodeMirror).
2. Add websocket room with broadcast of text ops.
3. Wire “Ask AI” button → post buffer → Claude → patch suggestion.
4. Minimal conflict handling: last-write-wins for MVP.
5. Demo script & seed snippet (e.g., buggy function).

---

## Scoring Hooks (use across projects)

- **Clarity:** One killer interaction, 30-sec demo story.
- **Grounding:** Citations/graphs/validations visible.
- **Reliability:** Show a micro-eval or guardrail.
- **Sponsor Fit:** Call out the specific service used and why.
- **Ship-ability:** Live URL, short README, env-vars documented.

---