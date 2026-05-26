# Lead Generation Management Agent - Specification Document

## Project Overview

This project is designed to help students learn how modern AI agents are built, orchestrated, deployed, and maintained in real-world environments.

The goal is to build a Telegram-based AI Lead Generation Agent capable of:
- Finding business leads
- Researching companies
- Extracting useful contact information
- Organizing structured lead data
- Delivering lead insights directly through Telegram

The project should be:
- Modularized properly
- Beginner friendly
- Production oriented
- Deployable publicly
- Usable through Telegram

---

# Recommended Tech Stack

| Layer | Technology |
|---|---|
| Development Environment | Cursor |
| Backend | Next.js Route Handlers |
| AI Agent Workflow | Trigger.dev |
| AI Models | OpenRouter |
| Messaging Interface | Telegram Bot |
| Database | Railway Postgres |
| Deployment | Railway |
| Search/Research APIs | Tavily |
| Optional Integrations | Composio |

---

# Why Telegram Instead of Full Website

For Version 1, Telegram is preferred because:
- Faster development
- No frontend complexity
- Easier automation workflow
- Real conversational AI experience
- Faster MVP deployment

This project focuses on building AI agent intelligence rather than frontend engineering.

---

# Phase 1 - Agent Skill Definition

Create:
skills/agent_skill.md

This file acts as the brain instructions for the AI Lead Generation Agent.

Agent Role:
- Senior Lead Generation Specialist
- Prospect Research Assistant
- Business Outreach Intelligence Agent

Responsibilities:
- Understand user requests
- Identify target business niche
- Find relevant companies
- Extract structured lead information
- Summarize useful outreach angles

---

# Phase 2 - Telegram Bot Setup

Create Telegram Bot using BotFather.

The bot should:
- Accept user commands
- Receive niche/company requests
- Send generated lead lists
- Return structured responses

Example:
/find-leads AI startups in Chennai

---

# Phase 3 - Research Tool

Create research tools using:
- Tavily API
- Search APIs
- Optional scraping tools

The research system should:
- Search companies
- Find founder information
- Extract website links
- Find emails/social profiles
- Identify business niche relevance

---

# Phase 4 - Lead Extraction Engine

The agent should extract:
- Company Name
- Founder Name
- Website
- Email
- LinkedIn
- Industry
- Location
- Outreach Summary

The output should always remain structured.

---

# Phase 5 - Structured Output

Use structured JSON outputs.

Example:

```json
{
  "company": "Example AI",
  "founder": "John Doe",
  "website": "https://example.com",
  "email": "contact@example.com",
  "industry": "Artificial Intelligence",
  "summary": "AI SaaS startup focusing on automation."
}
```

---

# Phase 6 - Database Storage

Store lead information in Railway Postgres.

Database should support:
- Saving leads
- Searching leads
- Exporting lead data
- Managing lead history

---

# Phase 7 - Deployment

Mandatory:
- Push project to GitHub
- Deploy backend on Railway
- Configure environment variables securely

---

# Phase 8 - Future Improvements

After MVP completion:

Possible upgrades:
- WhatsApp integration
- Dashboard UI
- CRM integrations
- Automated outreach emails
- Multi-agent workflows
- Scheduled lead scraping
- AI lead scoring

---

# Expected Final Experience

User sends:
/find-leads SaaS companies in Chennai

The agent should:
1. Understand the niche
2. Search relevant businesses
3. Extract structured lead data
4. Generate outreach insights
5. Send organized lead results in Telegram

---

# Folder Structure

```bash
app/
agents/
skills/
tools/
lib/
database/
telegram/
```

---

# Mandatory Deliverables

- Working Telegram AI Agent
- GitHub Repository
- Railway Deployment
- Clean Code Structure
- README Documentation
- Structured AI Workflow

---

# Learning Outcomes

By completing this project, the student will learn:
- AI agent architecture
- Workflow orchestration
- LLM integration
- API integrations
- Structured outputs
- Database handling
- Production deployment
- Telegram bot development

---

# Final Goal

Build a practical AI Lead Generation Agent that simulates a real-world automation business workflow while teaching modern AI engineering concepts.
