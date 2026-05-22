# WhatsApp Decision Bot

A production-ready WhatsApp automation bot built with **Node.js**, **Express**, **MongoDB**, and a **Retrieval-Augmented Generation (RAG)** workflow.  
It automatically decides when to reply, when to stay quiet, and when to let a human take over — making it suitable for customer support, lead handling, and business conversations.

---

## Overview

This bot is designed to work as a smart WhatsApp assistant with:

- **Automatic message handling**
- **Personal message detection**
- **Human handoff protection**
- **Conversation memory**
- **Knowledge-base powered AI replies**
- **MongoDB persistence for contacts and history**

It is built to be portable, easy to deploy, and easy to extend.

---

## Key Features

### Smart Reply Logic
- Replies only to text messages
- Supports **auto-reply**, **conditional auto-reply**, and **manual override**
- Detects personal messages such as:
  - bro
  - sis
  - love
  - call me
  - dinner
  - party
  - movie

### Human Handoff Protection
- If a human replies manually, the bot pauses for a configurable cooldown period
- Prevents the bot from interrupting a live conversation

### Conversation Memory
- Stores per-contact memory in MongoDB
- Keeps track of:
  - last sender
  - last message
  - last bot reply
  - message history
  - update timestamps

### Knowledge-Base Powered Responses
- Uses a local `knowledge_base/` folder for business knowledge
- Supports RAG-style AI responses based on stored content
- Easy to update by adding or editing Markdown files

### Admin-Friendly Endpoints
- Update contact settings
- Inspect contact memory
- Mark conversations as human-handled

### Deployment Ready
- Works with any Node.js hosting platform
- Suitable for Render, Railway, or similar services
- Uses environment variables for configuration

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **AI / RAG:** Pinecone + AI chat generation
- **HTTP Client:** Axios
- **Environment Variables:** dotenv
- **Webhook Parsing:** body-parser

---

## Project Structure

```text
.
├── index.js
├── classifier.js
├── package.json
├── README.md
├── DEPLOYMENT.md
├── TESTING.md
├── .env.example
├── knowledge_base/
│   └── README.md
├── scripts/
│   ├── ingest.js
│   └── test-flow.js
└── src/
    ├── db.js
    ├── models/
    │   └── Contact.js
    └── rag/
        └── chat.js
