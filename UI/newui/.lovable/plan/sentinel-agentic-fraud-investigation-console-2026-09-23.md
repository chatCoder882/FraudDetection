# Sentinel — Agentic Fraud Investigation Console

## Goal
Build the actual dark-mode fraud analyst application, not a marketing site. The interface will make each investigation understandable at a glance through a consistent sequence:

**What we found → Why it matters → What should happen → Who must approve it**

All work is frontend-only. Existing agent logic, TigerGraph queries, fraud scoring, policy rules, case memory, evidence generation, SAR generation, and backend data models remain untouched.

## Product structure

### Shared analyst shell
- Persistent collapsible left navigation grouped into Investigation, Operations, Intelligence, and System.
- Compact top bar with breadcrumb/page title, multi-entity global search, notifications, live agent indicator, and analyst profile.
- Responsive behavior: desktop density is preserved; smaller screens use a slide-over navigation and stack complex panes without losing access to evidence or actions.
- `/` redirects to `/dashboard` so the application opens directly into the analyst experience.

### Routes
- `/dashboard` — operational metrics, risk distribution, recent activity, and active investigations.
- `/cases` — searchable, sortable, filterable case queue.
- `/cases/$id` — investigation workspace with Overview, Investigation, Evidence, Graph, Actions, SAR, Memory, and Audit tabs.
- `/approvals` — All, L1, L2, SAR, and Completed approval queues.
- `/sar` — document-style SAR report review.
- `/memory` — historical case search and similarity explanations.
- `/patterns` — known and newly discovered fraud patterns.
- `/policy` — policy rules and action permission matrix.
- `/agent` — live agent workflow and tool activity.
- `/system` — service health for TigerGraph, Agent, Policy Engine, GraphRAG, Case Memory, and API.
- `/settings` — restrained analyst preferences and notification settings.

Every content route will receive unique Sentinel-specific title, description, Open Graph, and Twitter metadata.

## Core experiences

### Dashboard and case queue
- Dense metric strip for active investigations, approvals, high-risk cases, evidence requests, closed cases, and SAR-required cases.
- Risk distribution chart and chronological investigation activity.
- Case table with Case ID, trigger, customer, probability, verdict, pattern, exposure, status, and next action.
- Filters for status, risk, verdict, trigger, and fraud pattern, plus sorting and useful empty/loading/error states.
- Selecting a row opens its investigation workspace.

### Investigation workspace
- Three-pane desktop layout: compact case queue, primary investigation timeline, and graph/action intelligence rail.
- Immediate case header with trigger, customer, transaction, state, probability, verdict, pattern, and exposure.
- Recharts probability progression with evidence-linked changes and semantic risk thresholds.
- Structured agent timeline covering scope, transaction, baseline, device, graph, pattern, memory, policy, evidence request, reassessment, and final decision.
- Every step exposes status, finding, source/tool, time, and probability delta instead of hiding reasoning in prose.
- First-class uncertain state showing current probability, evidence gaps, why evidence is insufficient, and the recommended evidence request.

### Evidence, graph, and entity inspection
- Evidence ledger with type, finding, source/tool, entities, likelihood impact, before/after probability, and timestamp.
- Real interactive React Flow graph for Customer, Card, Transaction, Device, Email, Region, and Case entities, including the requested relationships.
- Graph controls for zoom, fit, neighbor expansion, node-type filtering, and reset.
- Reusable detail drawer variants for transactions, customers, and cards, including related activity and cases.
- Immutable-looking audit trail with timestamp, actor, event, change, and source.

### Decisions and approvals
- Side-by-side initial and final recommendation summaries with action, reason, policy rule, approval route, and status.
- “What Changed?” block tying new evidence to probability movement and the revised action.
- Clear execution badges for Auto-executable, L1, L2, and Human approval required.
- Approval actions never imply execution when policy requires review; approve, reject, and request-more-evidence interactions remain demo-only and visibly update mock UI state.

### Supporting intelligence views
- SAR viewer with subject, activity summary, transactions, pattern, evidence, regulatory references, filing decision, and review controls.
- Case Memory similarity table with matching reasons and current-case retrieval context.
- Fraud Pattern library with signals, case counts, typical actions, and an undocumented/discovered state.
- Policy rule list and highly legible Action Permission Matrix.
- Live agent state pipeline: TRIGGER → SCOPE → EVIDENCE → ASSESS → REQUEST → REASSESS → DECIDE → POLICY → ACTION → EXPLAIN → MEMORY.
- System health view with clear healthy, degraded, and unavailable states.

## Visual direction
- Near-black neutral background with charcoal panels, crisp 1px borders, compact spacing, and minimal surface elevation.
- Restrained enterprise SOC aesthetic rather than generic SaaS cards or chat UI.
- Semantic red for fraud/critical, amber for uncertainty, green for legitimate/approved, blue for investigation/information, and purple only for AI/case memory.
- Typography optimized for dense scanning: compact sans-serif UI text with monospaced identifiers and numeric values.
- Subtle entrance, state-change, and graph-selection motion with reduced-motion support; no decorative gradients, glass panels, or ornamental effects.

## Data and integration boundary
- Add a typed frontend domain model based on the repository’s authoritative `case_pack.csv`, `cases/HHG-003.json`, graph schema, and policy vocabulary.
- Keep all reads and mutations behind one dedicated service interface. The default adapter serves realistic mock/demo data; a future adapter can connect the existing backend without changing page components.
- Do not invent endpoint URLs, request payloads, backend mutations, scoring calculations, or policy decisions.
- Preserve backend-provided SAR text whenever available; mock text is clearly demo data.
- Model all requested case states and outcomes: Fraud, Legitimate, and Uncertain.

## Technical implementation
- Use the existing TanStack Start route system, React 19, Tailwind v4 semantic tokens, shadcn components, and Recharts.
- Add `@xyflow/react` for the interactive graph and `@tanstack/react-table` for production-grade queue filtering/sorting.
- Build reusable shell, status badge, metric, data table, probability chart, timeline, evidence item, recommendation, graph, entity drawer, audit row, and page-state components.
- Keep route files thin and compose shared feature components from typed mock selectors.
- Validate desktop and mobile layouts in the running preview, including graph rendering, drawer interaction, table filters, route navigation, and text overflow.

## Scope guardrails
- No backend creation or modification.
- No Cloud/database/auth setup.
- No changes to TigerGraph, policy, agent, memory, SAR, fraud scoring, or evidence logic.
- No fabricated API contract.
- Interactive controls demonstrate frontend behavior only until the existing backend is connected.
