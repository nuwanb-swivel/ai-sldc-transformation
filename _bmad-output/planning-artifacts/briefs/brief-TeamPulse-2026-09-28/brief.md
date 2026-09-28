---
title: TeamPulse
status: ready
created: 2026-09-28
updated: 2026-09-28
---

# Product Brief: TeamPulse

## Executive Summary

TeamPulse is an internal, company-wide application where employees submit feedback and ideas, and everyone else can upvote the ones they care about. Each idea moves through a simple, visible pipeline — New → Under Review → Planned → Done, owned by an admin — so people can see that what they raised actually goes somewhere, not just into a Slack thread that scrolls away.

This is deliberately a first step, not a finished product. The MVP is intentionally narrow — submit, browse, upvote, track status — so the team can get it in front of the whole organization quickly, see how it's actually used, and build out richer workflows (Slack integration, automation, and whatever else the usage data suggests) from a real foundation instead of guessing upfront.

## The Problem

Today, ideas and feedback likely live in scattered, ephemeral places — Slack threads, hallway conversations, one-off polls — none of which are built to collect input, show what's popular, or show what happened to it. `[ASSUMPTION: no existing tool for this was named as currently in use — validate whether a spreadsheet, Slack channel, or suggestion box already exists and is being replaced.]`

The cost of that status quo:
- Ideas get lost or forgotten because there's no durable, visible home for them.
- People can't easily signal "I want this too" the way upvoting allows, so real demand is invisible.
- Without a visible status pipeline, contributors have no way to know whether their idea was seen, rejected, or is actually being worked on — which discourages future participation.

## The Solution

TeamPulse gives every employee a single place to:
- **Browse** existing feedback/ideas submitted by anyone in the organization.
- **Add** a new idea.
- **Upvote** ideas they support, surfacing what the organization actually wants most.
- **Track status** as an idea moves New → Under Review → Planned → Done, so contributors can see progress without having to ask.

An **admin** role can change an idea's status, giving the organization a lightweight, visible triage process without building a full workflow engine on day one.

The experience is **mobile-first** — most employees will likely check and vote on ideas in spare moments, not at a desk — and **authenticated** with simple username/password login, since this is an internal, company-wide tool rather than a public one.

## What Makes This Different

There's no fabricated moat here — this is an internal tool competing with informal habits (Slack, hallway conversation), not other products. Its advantage is simply that it's **purpose-built and persistent**: a dedicated, always-available home for ideas with visible status, versus fragmented conversations that disappear. The real long-term differentiator will come from what's built *on top* of this MVP — Slack integration and automated workflows — but that's explicitly future scope, not part of what justifies v1.

## Who This Serves

**Primary users: all employees across the organization.** They want a fast, low-friction way to raise an idea or give feedback, see what others have proposed, back the ideas they care about, and know whether anything is happening as a result. Success for them looks like: "I submitted something, I can see it's being looked at, and I can see what other people want too."

**Admin(s)** — `[ASSUMPTION: a small set of trusted people (e.g., leadership, ops, or a coordinating team) rather than a broad role — confirm who exactly should hold this permission before build.]` They need a simple way to move ideas through the pipeline as decisions are made, without a heavyweight process.

## Success Criteria

- **Primary adoption target: more than 70% of the organization submits at least one idea within the first month of launch.**
- Supporting signals worth tracking even though not formally targeted yet: number of ideas reaching Planned/Done (proof the pipeline isn't just collecting dust), upvotes per idea (engagement beyond just submitting), and return usage (people coming back to vote, not just to post once). `[ASSUMPTION: these secondary metrics are proposed, not confirmed — revisit once real usage data exists.]`

## Scope

**In for v1 (MVP):**
- View all submitted feedback/ideas
- Submit a new idea
- Upvote an idea
- Status pipeline: New → Under Review → Planned → Done
- Admin ability to change an idea's status
- Username/password authentication
- Mobile-first responsive design

**Explicitly out for v1:**
- Slack integration
- Automated workflows/triggers based on status changes or other events

**Not yet decided — flagged for a fast follow-up decision, not v1 build:** `[ASSUMPTION: the user had no immediate view here; these are common in this kind of product and worth a deliberate yes/no before or shortly after build, rather than defaulting silently.]`
- Comments/discussion on an idea
- Categories or tags
- Notifications (e.g., "your idea changed status")
- Editing or withdrawing your own submitted idea
- Duplicate idea detection/merging
- Anonymous submission vs. attributed-only

## Vision

TeamPulse starts as a simple, visible feedback-and-voting loop, but the intent is for it to grow into the organization's connective tissue for ideas — surfacing what people want, showing it's being acted on, and eventually plugging into the tools the organization already lives in (starting with Slack) so raising and tracking an idea takes seconds, not a context switch. As usage grows, the roadmap can be shaped by real data on what people actually submit, vote on, and follow up about — rather than upfront guesswork.
