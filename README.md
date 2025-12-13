# WhatsApp Decision Bot (Self-Contained)

This is a production-ready, standalone WhatsApp automation service. It includes its own database (MongoDB) and RAG (Retrieval-Augmented Generation) engine, making it portable and ready for resale or independent deployment.

## Features

- **Self-Contained RAG**: Built-in Pinecone retrieval and OpenRouter generation. No external RAG API dependency.
- **MongoDB Storage**: Persists contacts, conversation history, and settings.
- **Smart Decision Logic**:
    - **Personalization**: Different handling for Customers, BFFs, Family, Friends.
    - **Human Hand-off**: Automatically pauses if a human replies.
    - **Context Awareness**: Distinguishes personal texts ("bro", "love") from business queries.
- **Deployable**: Ready for Render, Railway, or any Node.js host.

## Project Structure

```
whatsapp/
├── src/
│   ├── models/         # Mongoose Schemas (Contact, etc.)
│   ├── rag/            # RAG Logic (Chat, Retriever)
│   └── db.js           # Database Connection
├── index.js            # Main Server & Webhook Handler
├── classifier.js       # Message Intent Classifier
├── .env                # Configuration
└── package.json        # Dependencies
```

## Knowledge Base (RAG)

To teach the bot about your business:

1.  Add Markdown files (`.md`) to the `knowledge_base/` folder.
2.  Run `npm run ingest` to update the vector database.

## Setup & Testing

See [TESTING.md](./TESTING.md) for a step-by-step guide on how to run and test this locally.

## Configuration

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Connection string for MongoDB. |
| `PINECONE_API_KEY` | API Key for vector database. |
| `OPEN_ROUTER_KEY` | API Key for LLM generation. |
| `WHATSAPP_TOKEN` | Meta Cloud API Token. |
| `PHONE_NUMBER_ID` | Meta Phone Number ID. |
| `VERIFY_TOKEN` | Webhook verification token. |

## API Endpoints

- `POST /webhook`: Meta WhatsApp Webhook.
- `POST /contact/update`: Update contact settings (e.g., disable auto-reply).
    - Body: `{ "phone": "...", "type": "friend", "autoReply": "conditional" }`
- `POST /memory/human`: Manually mark a conversation as "human handled".
    - Body: `{ "phone": "..." }`
