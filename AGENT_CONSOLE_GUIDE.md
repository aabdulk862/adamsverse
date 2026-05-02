# Adverse Solutions — AI Agent Console Guide

## What Is This?

The Agent Console is an internal tool for Adverse Solutions operators. It coordinates specialized AI agents to run business audits, generate outreach content, automate workflows, conduct research, and build structured plans.

You interact with it through a browser-based chat interface at `/agents`. You describe what you need, the system breaks it into tasks, shows you the plan for approval, then executes it through specialized agents.

## Quick Start

1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173/agents`
3. Enter the passphrase: `adverse2025` (or whatever you set in `VITE_AGENT_PASSPHRASE`)
4. Type a request in the chat

## Current Status

The orchestration framework is fully built and functional:
- Intent classification (audit, outreach, build, research, automate, plan)
- Task decomposition with dependency chains
- Alignment checks (approve/revise before execution)
- Pipeline execution engine
- Dashboard UI (chat, task board, artifact viewer, agent registry)

**What's not wired yet:** The agents produce placeholder output. The `executeSession` function in `src/lib/agents/session.js` generates stub data based on the output schema instead of calling a real LLM. To get real agent output, you need to connect an LLM provider (Ollama for free local, or OpenAI/Anthropic for cloud).

## Console Pages

### `/agents` — Chat Interface
The main interaction point. Type a request, get an alignment check, approve it, watch the pipeline execute.

**Example requests:**
- "Run a business audit on my bakery operations"
- "Generate outreach for Acme Corp"
- "Research competitor pricing for web development agencies"
- "Build a landing page specification"
- "Plan a Q4 marketing strategy"
- "Automate the client onboarding workflow"

### `/agents/registry` — Agent Registry
Browse the five built-in agent roles. Click any card to see its full configuration (system prompt, input/output schemas).

| Agent | What It Does |
|-------|-------------|
| Planner | Breaks goals into steps, synthesizes reports |
| Research | Gathers and validates information |
| Builder | Generates code, configs, documents |
| Audit | Evaluates against quality criteria with scores |
| Automation | Creates n8n workflow definitions |

### `/agents/artifacts` — Artifact Browser
Browse outputs from completed pipelines. Filter by type (audit reports, outreach drafts, plans, etc.). Click any artifact to see its formatted content.

## How the Orchestration Works

```
You type a request
    ↓
classifyIntent() → determines intent (audit, outreach, build, etc.)
    ↓
decomposeRequest() → creates ordered tasks with agent assignments
    ↓
formatAlignmentCheck() → shows you the plan
    ↓
You approve (or revise)
    ↓
createPipeline() → persists the pipeline
    ↓
executePipeline() → runs tasks in dependency order
    ↓
Each task: createSession() → executeSession() → validateOutput()
    ↓
synthesizeResults() → collects all artifacts into final output
```

## Workflow Templates

### Business Audit (4 tasks)
1. **Planner** → Define audit scope
2. **Research** → Gather business data (if URL provided, extracts from it)
3. **Audit** → Evaluate across 5 categories (operations, UX, automation gaps, tech stack, customer experience) with scores 1-10
4. **Planner** → Synthesize findings into report

### Outreach Generation (3 tasks)
1. **Research** → Gather prospect information
2. **Planner** → Define outreach strategy
3. **Builder** → Generate email draft, LinkedIn message, proposal outline with `[placeholder]` notation

### Build Request (2 tasks)
1. **Planner** → Plan implementation
2. **Builder** → Build deliverable

### Research Request (2 tasks)
1. **Research** → Research topic
2. **Planner** → Synthesize findings

### Automation Request (2 tasks)
1. **Planner** → Plan automation workflow
2. **Automation** → Define n8n workflow

## Architecture

```
src/
├── lib/
│   ├── orchestrator/
│   │   ├── index.js        ← Intent classification, decomposition, synthesis
│   │   ├── pipeline.js     ← Pipeline creation, execution, dependency resolution
│   │   ├── alignment.js    ← Alignment check formatting and response parsing
│   │   ├── db.js           ← Supabase persistence (optional, graceful when missing)
│   │   └── n8n.js          ← n8n workflow connector (optional)
│   └── agents/
│       ├── registry.js     ← Agent role registry (in-memory defaults, optional Supabase)
│       ├── session.js      ← Agent session lifecycle (← CONNECT LLM HERE)
│       └── contracts.js    ← Schema validation, data transformation, transfer logging
├── components/agents/
│   ├── AgentLayout.jsx     ← Console shell (top bar, nav, outlet)
│   ├── ChatInterface.jsx   ← Message list, input, typing indicator
│   ├── TaskBoard.jsx       ← Pipeline task cards with status badges, progress bar
│   ├── AlignmentCard.jsx   ← Plan approval/revision UI
│   ├── ArtifactViewer.jsx  ← Formatted artifact display (audit reports, outreach, code, etc.)
│   └── AgentCard.jsx       ← Agent role card for registry browser
├── pages/
│   ├── AgentChatPage.jsx   ← Main chat page, wires everything together
│   ├── AgentRegistryPage.jsx ← Agent role browser
│   └── ArtifactBrowserPage.jsx ← Artifact list with type filters
└── ...
```

## Authentication

The agent console uses a simple passphrase gate — not tied to the main site's Supabase auth.

- Default passphrase: `adverse2025`
- Override via env: `VITE_AGENT_PASSPHRASE=your-passphrase`
- Stored in `sessionStorage` (clears when browser tab closes)
- Completely separate from `/dashboard` (client portal) and `/admin` routes

## Persistence

Currently runs in-memory — no database required. Agent roles come from the hardcoded defaults in `registry.js`.

To enable Supabase persistence later:
1. Run the migration: `supabase/migrations/004_agent_orchestration.sql`
2. Set `VITE_SUPABASE_SERVICE_ROLE_KEY` in a **backend** environment (not in `.env.local` — never expose service-role keys to the browser)
3. The system auto-detects the key and switches from in-memory to Supabase

## Connecting an LLM (Next Step)

The single file to modify: `src/lib/agents/session.js`

Replace the `generateOutput()` function with a real LLM call. The function receives a `session` object containing:
- `session.system_prompt` — the agent's role instructions
- `session.input_data` — the task input
- `session.conversation_history` — prior messages
- `session.agent_role.output_schema` — expected output format

**Option A: Ollama (free, local)**
- Install from ollama.com
- Run `ollama pull llama3.1`
- API at `http://localhost:11434/api/chat`
- No API key needed

**Option B: OpenAI**
- Set `VITE_OPENAI_API_KEY` in `.env.local`
- Call `https://api.openai.com/v1/chat/completions`
- Costs per token

**Option C: Anthropic**
- Set `VITE_ANTHROPIC_API_KEY` in `.env.local`
- Call Claude API
- Costs per token

## Kiro Integration

The steering files and skills in `.kiro/` give Kiro (this IDE agent) context about the orchestration system:

- `.kiro/steering/agent-orchestration.md` — System overview and module reference
- `.kiro/skills/run-audit.md` — How to trigger audit workflows
- `.kiro/skills/generate-outreach.md` — How to trigger outreach generation
- `.kiro/skills/manage-agents.md` — How to manage agent roles
- `.kiro/skills/view-artifacts.md` — How to retrieve artifacts

These help Kiro assist you when working on the agent system. They don't make Kiro run the agents — Kiro is a dev assistant, the agent console is the product.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_AGENT_PASSPHRASE` | No | Console passphrase (default: `adverse2025`) |
| `VITE_SUPABASE_URL` | No* | Supabase project URL (for persistence) |
| `VITE_SUPABASE_ANON_KEY` | No* | Supabase anon key (for main site auth) |
| `VITE_N8N_API_URL` | No | n8n instance URL (for workflow automation) |
| `VITE_N8N_API_KEY` | No | n8n API key |

*The agent console works without Supabase. These are only needed for the main site's client dashboard.

**Never put `VITE_SUPABASE_SERVICE_ROLE_KEY` in `.env.local`** — it gets bundled into browser JavaScript. Use it server-side only when you add a backend API.

## Tests

429 tests across 19 test files covering all orchestrator modules, agent components, and pages.

```bash
# Run all agent-related tests
npm test -- src/__tests__/unit-contracts.test.js src/__tests__/registry.test.js src/__tests__/unit-orchestrator-session.test.js src/__tests__/unit-orchestrator-index.test.js src/__tests__/unit-orchestrator-alignment.test.js src/__tests__/unit-orchestrator-pipeline.test.js src/__tests__/unit-orchestrator-db-artifacts.test.js src/__tests__/unit-orchestrator-n8n.test.js src/__tests__/unit-orchestrator-audit-pipeline.test.js src/__tests__/unit-orchestrator-outreach-pipeline.test.js src/__tests__/unit-orchestrator-lifecycle.test.js src/components/agents/ChatInterface.test.jsx src/components/agents/TaskBoard.test.jsx src/components/agents/AlignmentCard.test.jsx src/components/agents/ArtifactViewer.test.jsx src/components/agents/AgentCard.test.jsx src/pages/AgentChatPage.test.jsx src/pages/AgentRegistryPage.test.jsx src/pages/ArtifactBrowserPage.test.jsx
```
