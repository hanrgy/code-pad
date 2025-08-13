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

## 2) Personal Finance Tracker w/ Smart Categorization & Budgets

**Pitch:** Drag-drop bank CSV; auto-categorize transactions, set simple budgets, and get an LLM monthly summary.

**Core Scope (MVP):**
- CSV import (date, desc, amount).
- Heuristic + LLM categorization (fallback only).
- Budget by category; over/under highlights.
- “Explain my month” summary paragraph.

**Suggested Stack:**
- DB: MongoDB Atlas (or Snowflake for SQL comfort).
- API: Claude function-calling for ambiguous rows.
- UI: Next.js + basic chart (bar by category).

**60-Minute Path:**
1. File upload → parse with Papaparse/fast-csv.
2. Heuristic rules first; batch send uncertain rows to Claude.
3. Persist to Atlas/Snowflake; compute totals vs. budget.
4. Render category chart + overage badges.
5. “Explain” button → LLM summary with 3 insights.

---

## 3) Company Docs Q&A — Hybrid RAG in 1 Hour

**Pitch:** Upload a few PDFs/Markdowns and ask grounded questions; answers cite exact passages.

**Core Scope (MVP):**
- Small ingest (3–10 docs).
- Chunking + embeddings + hybrid search (semantic + keyword).
- Answer synthesis with inline citations and confidence hint.

**Suggested Stack:**
- Retrieval: Vectara (hosted hybrid) **or** Qdrant Cloud + BM25.
- Orchestration: LangChain minimal RAG chain.
- LLM: Claude for synthesis.

**60-Minute Path:**
1. Ingest script: chunk + embed (or push to Vectara).
2. Simple search endpoint (hybrid or rerank).
3. Answer route: top-k → Claude with citations.
4. Lightweight UI: question box + source drawer.
5. Include one eval: “Does the answer quote sources?”

---

## 4) GraphRAG “Context Map” for an Incident Postmortem

**Pitch:** Turn a small incident log into a graph (systems, events, causes). Ask “root cause?” and traverse evidence.

**Core Scope (MVP):**
- Nodes: {Service, Event, Symptom, Hypothesis}.
- Edges: {causes, occurs-in, observed-by}.
- LLM proposes nodes/edges; human accept-all for demo.
- Query: “What caused X?” → subgraph + rationale.

**Suggested Stack:**
- Graph: Neo4j Aura Free (or local Docker).
- Data cloud: Optional Snowflake for raw log storage.
- LLM: Claude to extract structured triples.

**60-Minute Path:**
1. Paste sample log → LLM → (nodes, edges) JSON.
2. Load into Neo4j (neo4j-python / cypher).
3. Simple UI: force-graph + sidebar answers.
4. Pre-canned queries: root cause of Incident-123.
5. Show a clickable path (Event → Service → Cause).

---

## 5) Agentic ETL Copilot for CSV→DB (with Guardrails & Evals)

**Pitch:** An agent proposes a schema, loads the CSV, validates types, and reports anomalies with fix suggestions.

**Core Scope (MVP):**
- Schema proposal (types, PK suggestion).
- Load into target DB.
- Validation report (nulls, outliers, type mismatches).
- One “auto-fix” (e.g., date parsing).

**Suggested Stack:**
- Agent: Claude + simple tool calls (schema, load, validate).
- DB: MongoDB Atlas **or** Snowflake (choose one).
- UI: Single page with steps & logs.

**60-Minute Path:**
1. Agent prompt with CSV header sample → schema JSON.
2. Create table/collection; bulk load.
3. Run validations; collect issues.
4. Offer one auto-fix; re-validate.
5. Render a concise report + download JSON.

---

## Scoring Hooks (use across projects)

- **Clarity:** One killer interaction, 30-sec demo story.
- **Grounding:** Citations/graphs/validations visible.
- **Reliability:** Show a micro-eval or guardrail.
- **Sponsor Fit:** Call out the specific service used and why.
- **Ship-ability:** Live URL, short README, env-vars documented.

---