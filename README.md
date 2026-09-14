# 🔍 CRIMENET

## AI-Powered Criminal Network Analysis System

> **CRIMENET turns scattered investigation records into one connected, visual, and AI-assisted investigation workspace.**

CRIMENET is an AI-assisted investigation support platform designed to help investigators connect and analyze **cases, entities, evidence, locations, and network relationships** through a unified interface.

Developed for **Smart India Hackathon 2026** under the Ministry of Home Affairs.

---

## 🎯 Smart India Hackathon 2026

| Details | Information |
|---|---|
| **Problem Statement** | SIH26189 |
| **Title** | AI-Powered Criminal Network Analysis System |
| **Ministry** | Ministry of Home Affairs |
| **Category** | Software |
| **Domain** | Blockchain & Cybersecurity |
| **Project Name** | CRIMENET |

---

## 💡 Problem Statement

Criminal investigations can involve large amounts of fragmented information such as:

- FIR and case records
- Suspect and entity information
- Evidence
- Locations
- Case relationships
- Network activity
- Investigation reports

When these records are distributed across different sources, identifying connections, patterns, and relationships can become difficult.

---

## 🚀 Our Solution

CRIMENET provides a unified investigation workspace that connects fragmented investigation information.

**Investigation Flow:**

Cases → Entities → Evidence → Locations → Relationships → Network Analysis → NEXUS-AI → Investigation Insights

The platform helps investigators understand:

> **WHO is connected to WHOM, WHERE are they connected, and HOW are those relationships formed?**

---

## ✨ Key Features

### 📊 Investigation Dashboard

- Active investigation overview
- Tracked entities and suspects
- Network entities and nodes
- Geospatial investigation hotspots
- Syndicate network topology
- National spatial threat visualization

### 📁 Case Management

- Create new investigation cases
- Case severity classification
- Case status tracking
- Executive summaries
- FIR / case-document upload
- Case dossier
- Case-to-entity relationships
- Publicly documented case records
- Synthetic demonstration cases

### 👤 Entity & Suspect Analysis

- Entity profiles
- Case associations
- Investigation context
- Location information
- Analytical indicators
- Related evidence
- Network connections

### 🕸️ Network Analysis

- Dynamic network graph
- Case-based filtering
- Network/syndicate filtering
- Entity search
- Node selection
- Relationship visualization
- Network clusters
- Top connections
- Automatic graph layout
- Fit-to-view visualization

### 🗺️ Crime Map

- Geographic visualization
- Location-based analysis
- Investigation hotspots
- Case-related locations

> Geospatial hotspots represent concentrations within the available investigation dataset and should not be interpreted as predictions of criminal activity.

### 🤖 NEXUS-AI

NEXUS-AI provides AI-assisted investigation analysis using the **Groq API**.

**Current AI Model:** `openai/gpt-oss-20b`

NEXUS-AI assists with investigation analysis and summaries but does not replace human investigation or legal decision-making.

### 📄 Evidence Management

- Evidence records
- Evidence categorization
- Case association
- Investigation context

### 📑 Reports

- Investigation reports
- Case summaries
- Network analysis summaries

### 🚨 Alerts

- Investigation alerts
- Priority notifications
- Network-related alerts
- Investigation events

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────┐
│       CRIMENET FRONTEND         │
│        React + TypeScript       │
│                                 │
│ Dashboard | Cases | Network | AI│
└────────────────┬────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────┐
│        CRIMENET BACKEND         │
│      Node.js + Express + TS     │
└────────────────┬────────────────┘
                 │
          ┌──────┴───────┐
          ▼              ▼
┌─────────────────┐ ┌────────────────┐
│ Investigation   │ │    Groq API    │
│ Data            │ │   NEXUS-AI     │
└─────────────────┘ └────────────────┘
