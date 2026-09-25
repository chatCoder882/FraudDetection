# Sentinel Investigations

Build a modern, production-quality frontend UI for my existing project Sentinel — Agentic Fraud Investigation.

GitHub repo:
https://github.com/r-rishit27/hacker_house

CRITICAL CONSTRAINT

Frontend only. Do NOT modify or recreate the backend.

The existing backend, APIs, agent logic, TigerGraph integration, fraud scoring, evidence system, policy engine, case memory and data models must remain unchanged.

You will NOT have access to the backend, so build the UI around the functionality/data described below. Use mock data only for UI demonstration and keep API integration isolated so the existing backend can be connected later.

The attached project brief describes the required investigation workflow: trigger → investigate → gather evidence → assess uncertainty → gather more evidence → recommend action → explain → update case memory.

PRODUCT

Name: SENTINEL
Subtitle: Agentic Fraud Investigation Console

Primary user: Fraud Analyst.

The UI should look like a sophisticated bank fraud/SOC investigation platform, not a generic SaaS dashboard or chatbot.

Visual style

Dark-mode first

Near-black background

Dark panels with thin borders

Dense but clean information layout

Professional enterprise aesthetic

Minimal gradients/glassmorphism

Subtle animations

Semantic colors:

Red = fraud/critical

Amber = uncertainty/warning

Green = legitimate/approved

Blue = investigation/information

Purple = AI/memory

Use React + TypeScript + Tailwind + shadcn/ui (if compatible), Recharts and a graph library such as React Flow.

APPLICATION SHELL

Persistent left sidebar:

SENTINEL

Investigation

Dashboard

Case Queue

Investigations

Evidence

Graph Explorer

Operations

Approval Inbox

Actions

SAR Reports

Intelligence

Case Memory

Fraud Patterns

Policy & Rules

System

Agent Activity

System Health

Settings

Top bar:

Page title/breadcrumb

Global search

Notifications

Agent status

User profile

Global search should support Case ID, Transaction ID, Customer ID, Card ID, Device and Email.

REQUIRED PAGES

1. Dashboard

Show:

Active Investigations

Awaiting Approval

High Risk

Evidence Requests

Closed Cases

SAR Required

Also show:

Recent investigation activity

Risk distribution

Active investigation table

2. Case Queue

Search/filter/sort cases by:

Status

Risk

Verdict

Trigger

Fraud pattern

Case row should show:

Case ID | Trigger | Customer | Probability | Verdict | Pattern | Exposure | Status | Next Action

Clicking a case opens the investigation workspace.

3. INVESTIGATION WORKSPACE — MOST IMPORTANT SCREEN

Use a three-pane layout:

Left

Case queue

Center

Investigation timeline

Right

Graph + Next Best Action

Show:

Case ID

Trigger

Customer

Transaction

Status

Fraud probability

Verdict

Pattern

Exposure

Probability chart

Show probability progression, e.g.

0.20 → 0.38 → 0.61 → 0.78 → 0.89

Mark which evidence caused each change.

Agent timeline

Show steps such as:

Scope Investigation

Transaction Analysis

Customer/Card Baseline

Device Analysis

Graph Investigation

Fraud Pattern Detection

Prior Case Retrieval

Policy Assessment

Evidence Request

Final Decision

Each step shows:

Status

Finding

Source/tool

Timestamp

Probability change

4. EVIDENCE LEDGER

Every evidence item should show:

Evidence type

Finding

Source/tool

Related entities

Likelihood impact

Probability before/after

Timestamp

Example:

NEW DEVICE

Device not previously associated with card.

+0.73 LR

0.38 → 0.61

5. GRAPH EXPLORER

Create an interactive graph showing:

Nodes

Customer

Card

Transaction

Device

Email

Region

Case

Relationships

OWNS

MADE

FROM_DEVICE

PURCHASER_EMAIL

BILLED_IN

CONNECTED_TO

CITES

IMPLICATES

Controls:

Zoom

Fit

Expand neighbors

Filter node types

Reset

Clicking a node opens a detail drawer.

The graph must be a real interactive visualization, not an image.

6. NEXT BEST ACTION

Show both:

Initial Recommendation

Action
Reason
Policy rule
Approval route
Status

Final Recommendation

Action
Reason
Policy rule
Approval route
Status

Also show:

What Changed?

Example:

Probability: 0.78 → 0.89

New evidence: Customer denied transaction

New action: BLOCK_CARD

Approval: L2

Actions can include:

Allow transaction

Block transaction

Block account/card

Monitor account

Warn customer

Create case

File report

Request evidence

Escalate to analyst

Clearly distinguish:

Auto-executable

L1 approval

L2 approval

Human approval required

Never allow the UI to imply unauthorized actions can execute automatically.

7. APPROVAL INBOX

Tabs:

All

L1

L2

SAR

Completed

Each request shows:

Case | Action | Risk | Exposure | Reason | Policy | Approval Route

Buttons:

Approve

Reject

Request More Evidence

View Investigation

8. SAR REPORTS

Create a document-style SAR viewer containing:

Subject information

Activity summary

Transactions

Fraud pattern

Evidence

Regulatory/policy references

Filing decision

Actions:

Export

Copy

Approve

Return for Review

Use backend-generated SAR content when available.

9. CASE MEMORY

Search historical investigations.

Show:

Case ID

Outcome

Fraud pattern

Exposure

Similarity

Matching reasons

Actions taken

For the current case, show similar prior cases and why they were retrieved.

10. FRAUD PATTERNS

Show known fraud patterns with:

Description

Detection signals

Active cases

Historical cases

Typical actions

Also support:

Undocumented / discovered pattern

11. POLICY & RULES

Display policy rules and an Action Permission Matrix.

Show:

Action | Auto | L1 | L2 | Human Approval

Make approval requirements visually obvious.

12. AGENT ACTIVITY

Show live investigation workflow:

TRIGGER → SCOPE → EVIDENCE → ASSESS → REQUEST → REASSESS → DECIDE → POLICY → ACTION → EXPLAIN → MEMORY

Display:

Current agent state

Current tool

Evidence retrieved

Probability

Pending action

13. SYSTEM HEALTH

Show status of:

TigerGraph

Agent

Policy Engine

GraphRAG

Case Memory

API

CASE STATES

Support:

New

Investigating

Awaiting Evidence

Awaiting Approval

Action Required

Closed

Also support all three outcomes:

FRAUD / LEGITIMATE / UNCERTAIN

Uncertainty must be a first-class state.

For uncertain cases show:

Current probability

Evidence gaps

Why evidence is insufficient

Recommended evidence request

ENTITY DRAWERS

Create reusable drawers for:

Transaction

ID, amount, timestamp, risk score, customer, card, device, region, email, related cases.

Customer

Cards, transactions, devices, regions, risk history, cases.

Card

Customer, baseline statistics, transactions, devices, regions, cases.

AUDIT TRAIL

Every investigation should have an immutable-looking timeline:

Timestamp | Actor | Event | Change | Source

Example:

Sentinel → Evidence retrieved → New device detected

Sentinel → Probability → 0.38 → 0.61

Sentinel → Evidence requested → VERIFY_WITH_CUSTOMER

Policy Engine → Recommendation → BLOCK_CARD / L2

ROUTES

Implement:

/dashboard

/cases

/cases/:id

/approvals

/sar

/memory

/patterns

/policy

/agent

/system

/settings

Within a case provide tabs:

Overview | Investigation | Evidence | Graph | Actions | SAR | Memory | Audit

IMPORTANT UX PRINCIPLES

The analyst should understand within ~15 seconds:

What case is this?

What is the current risk?

Why?

What evidence was found?

What changed?

What does policy allow?

What is the next best action?

Does a human need to approve it?

What prior cases are relevant?

Do not hide reasoning behind a single AI-generated paragraph.

Show:

WHAT WE FOUND → WHY IT MATTERS → WHAT SHOULD HAPPEN

API / BACKEND INTEGRATION

Keep all backend interaction inside a dedicated API/service layer.

Do not invent or change API contracts.

If an endpoint is unknown, create a typed integration interface rather than inventing backend behavior.

Components should be reusable and data-driven.

Use loading, empty and error states.

Use mock data only as fallback/demo data.

PRIORITY

If implementation must be reduced, prioritize:

P0

Application shell

Case Queue

Investigation Workspace

Probability Chart

Agent Timeline

Evidence Ledger

Interactive Graph

Next Best Action

Approval states

P1

SAR

Case Memory

Policy

Audit Trail

Entity Drawers

P2

Agent Activity

Patterns

System Health

Settings

FINAL GOAL

Create a polished enterprise fraud-investigation interface demonstrating:

TRIGGER → INVESTIGATE → EVIDENCE → UNCERTAINTY → MORE EVIDENCE → REASSESS → NEXT BEST ACTION → APPROVAL/EXECUTION → EXPLANATION → CASE MEMORY

The frontend should make the existing backend look powerful and understandable without changing any backend behavior.

Do not build a marketing website. Build the actual analyst application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8abee576-d733-4eb0-b8de-ac5c322f5a10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
