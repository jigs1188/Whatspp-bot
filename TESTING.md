# 🧪 How to Test Your WhatsApp Bot

Since this bot is now self-contained with its own database and RAG logic, you can test it locally before deploying.

## Prerequisites

1.  **MongoDB**: Ensure you have a MongoDB instance running (local or Atlas).
2.  **Ngrok**: Install [ngrok](https://ngrok.com/) to expose your local server to the internet.
3.  **Meta App**: You need a Meta Developer app with WhatsApp product enabled.

## Step 1: Configure Environment

1.  Open `.env` in this folder.
2.  Fill in your **MongoDB URI**.
3.  Fill in **Pinecone** and **OpenRouter** keys (copy from your main project if needed).
4.  Fill in **Meta** credentials (`WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`).
5.  Set a `VERIFY_TOKEN` (e.g., `my_secret_token_123`).

## Step 1.5: Add Knowledge (RAG)

Before testing, give your bot something to talk about!

1.  Edit files in `knowledge_base/` (e.g., `services.md`).
2.  Run the ingestion script:

```bash
npm run ingest
```

This uploads your data to Pinecone so the bot can "read" it.

## Step 2: Start the Server

Run the bot in development mode:

```bash
npm run dev
```

You should see:
```
📦 MongoDB Connected
WhatsApp Bot (Mongo+RAG) running on port 3000
```

## Step 3: Expose to Internet

In a new terminal:

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://a1b2c3d4.ngrok-free.app`).

## Step 4: Configure Meta Webhook

1.  Go to [Meta Developers Console](https://developers.facebook.com/).
2.  Select your App -> WhatsApp -> Configuration.
3.  Click **Edit** under Webhook.
4.  **Callback URL**: `https://your-ngrok-url.app/webhook`
5.  **Verify Token**: The `VERIFY_TOKEN` you set in `.env`.
6.  Click **Verify and Save**.
7.  Click **Manage** under Webhook fields and subscribe to `messages`.

## Step 5: Test Scenarios

### 1. New User (Auto-Reply)
- Send "Hello" from a phone number not in your contacts.
- **Expected**: Bot replies using RAG context.
- **DB Check**: A new `Contact` document is created with `type: 'customer'`.

### 2. Personal Message (Conditional)
- Update the contact in DB to `type: 'friend', autoReply: 'conditional'`.
- Send "Bro, let's meet up".
- **Expected**: Bot **ignores** it (logs "Personal message detected").
- Send "What are your pricing plans?".
- **Expected**: Bot **replies** (business query).

### 3. Human Takeover
- Send a message. Bot replies.
- You (human) reply manually via WhatsApp app.
- **Wait**: Send another message immediately from the user phone.
- **Expected**: Bot **ignores** it because `lastBy` is 'human' (within 15 mins).

## Step 6: Deployment

Once tested, you can deploy this folder to Render/Railway/AWS.
Just ensure you set the same **Environment Variables** in your cloud provider dashboard.
