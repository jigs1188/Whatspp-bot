import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
import { connectDB } from "./src/db.js";
import { Contact } from "./src/models/Contact.js";
import { chatWithAI } from "./src/rag/chat.js";
import { isPersonalMessage } from "./classifier.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const GRAPH_VERSION = process.env.GRAPH_VERSION || "v19.0";
const HUMAN_COOLDOWN_MINUTES = Number(process.env.RECENT_HUMAN_MINUTES || 15);

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

/* -------- Health Check -------- */
app.get("/", (req, res) => {
  res.send("🤖 WhatsApp Bot is running! (Go to /webhook for Meta)");
});

/* -------- Webhook Verification -------- */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  
  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

/* -------- Incoming Messages -------- */
app.post("/webhook", async (req, res) => {
  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from; // Phone number
    const text = message.text?.body || "";
    const msgType = message.type;

    // 1. Get or Create Contact
    let contact = await Contact.findOne({ phone: from });
    if (!contact) {
      contact = await Contact.create({ phone: from });
    }

    // 2. Update Memory (User sent a message)
    contact.memory.lastBy = 'contact';
    contact.memory.lastMessage = msgType === 'text' ? text : `[${msgType}]`;
    contact.memory.updatedAt = new Date();
    
    // Push to history
    if (msgType === 'text') {
      contact.memory.history.push({
        role: 'user',
        content: text,
        timestamp: new Date()
      });
    }
    
    await contact.save();

    // 3. Decision Logic
    if (contact.autoReply === false) {
      console.log(`Skipping ${from}: Auto-reply disabled.`);
      return res.sendStatus(200);
    }

    // Check for recent human intervention
    if (contact.memory.lastBy === 'human') {
      const minutesSince = (Date.now() - new Date(contact.memory.updatedAt).getTime()) / 60000;
      if (minutesSince < HUMAN_COOLDOWN_MINUTES) {
        console.log(`Skipping ${from}: Human replied ${minutesSince.toFixed(1)}m ago.`);
        return res.sendStatus(200);
      }
    }

    // Conditional check
    if (contact.autoReply === "conditional" && isPersonalMessage(text)) {
      console.log(`Skipping ${from}: Personal message detected.`);
      return res.sendStatus(200);
    }

    // 4. Generate RAG Response
    // Only reply to text for now
    if (msgType !== 'text') return res.sendStatus(200);

    // Pass contact type and history to AI
    const reply = await chatWithAI(text, contact.type, contact.memory.history);

    // 5. Send Response
    await sendMessage(from, reply);

    // 6. Update Memory (Bot replied)
    contact.memory.lastBy = 'bot';
    contact.memory.lastBotReply = reply;
    contact.memory.updatedAt = new Date();
    
    // Push bot reply to history
    contact.memory.history.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date()
    });
    
    await contact.save();

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.sendStatus(500);
  }
});

/* -------- Admin / Manual Overrides -------- */
app.get("/contact/:phone", async (req, res) => {
  try {
    const contact = await Contact.findOne({ phone: req.params.phone });
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/contact/update", async (req, res) => {
  const { phone, type, autoReply } = req.body;
  try {
    const contact = await Contact.findOneAndUpdate(
      { phone },
      { type, autoReply },
      { new: true, upsert: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/memory/human", async (req, res) => {
  const { phone } = req.body;
  try {
    await Contact.findOneAndUpdate(
      { phone },
      { 
        "memory.lastBy": "human",
        "memory.updatedAt": new Date()
      }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------- WhatsApp API -------- */
async function sendMessage(to, text) {
  if (!process.env.WHATSAPP_TOKEN || !process.env.PHONE_NUMBER_ID) {
    console.error("Missing WhatsApp credentials");
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    // Log full axios error response for easier debugging (status, body)
    if (err.response) {
      console.error("WhatsApp API Error:", err.response.status, err.response.data);
    } else {
      console.error("WhatsApp API Error:", err.message);
    }
    throw err; // rethrow to be handled by caller
  }
}

app.listen(PORT, () => {
  console.log(`WhatsApp Bot (Mongo+RAG) running on port ${PORT}`);
});
