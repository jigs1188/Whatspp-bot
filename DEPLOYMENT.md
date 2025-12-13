# 🚀 Deployment Guide

This guide explains how to deploy your WhatsApp bot to **Render** (or any Node.js host) and connect it to **MongoDB Atlas**.

---

## 1. Database Setup (MongoDB Atlas)

You have two options for the database:

### Option A: Use Existing Cluster (Easiest)
If you already have a MongoDB Atlas account for your website:
1.  Get your existing Connection String (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/`).
2.  **Change the Database Name**: In the connection string, change the part after the slash `/`.
    *   Website: `.../automationai`
    *   WhatsApp Bot: `.../whatsapp-bot`
3.  This keeps your data separate (different databases) but uses the same free/paid cluster.

### Option B: Create New Free Cluster
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Project -> Build a Database -> **Shared (Free)**.
3.  Create a Database User (Username/Password).
4.  Network Access -> Allow Access from Anywhere (`0.0.0.0/0`).
5.  Get the Connection String.

---

## 2. Deploy to Render (Free/Cheap)

1.  Push this `whatsapp` folder to a **GitHub Repository**.
    *   *Note: If this is inside a larger repo, you can deploy just this folder by setting the "Root Directory" in Render.*

2.  Go to [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repo.
5.  **Settings**:
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Root Directory**: `whatsapp` (Only if this folder is inside a bigger repo. If it's the root of the repo, leave blank).

6.  **Environment Variables** (Copy from your `.env`):
    *   `MONGODB_URI`: Your connection string.
    *   `PINECONE_API_KEY`: Your Pinecone key.
    *   `PINECONE_INDEX`: `automationai` (or your index name).
    *   `OPEN_ROUTER_KEY`: Your OpenRouter key.
    *   `WHATSAPP_TOKEN`: Meta Access Token.
    *   `PHONE_NUMBER_ID`: Meta Phone ID.
    *   `VERIFY_TOKEN`: Your chosen secret token.
    *   `GRAPH_VERSION`: `v19.0`

7.  Click **Deploy Web Service**.

---

## 3. Connect Meta Webhook

Once Render finishes deploying, it will give you a URL (e.g., `https://whatsapp-bot.onrender.com`).

1.  Go to [Meta Developers](https://developers.facebook.com/).
2.  WhatsApp -> Configuration -> Webhook -> Edit.
3.  **Callback URL**: `https://whatsapp-bot.onrender.com/webhook` (Don't forget `/webhook`!).
4.  **Verify Token**: The same `VERIFY_TOKEN` you put in Render.
5.  Verify and Save.

---

## 4. Moving the Folder

If you want to move this `whatsapp` folder to a completely different computer or repository:

1.  Copy the entire `whatsapp` folder.
2.  Delete `node_modules` (it's heavy and will be re-installed).
3.  Paste it in the new location.
4.  Run `npm install`.
5.  Create a `.env` file with your keys.
6.  Run `npm run dev`.

It is completely self-contained!
