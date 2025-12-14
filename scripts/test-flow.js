import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Use environment-configured base URL or PORT so tests hit the actual server.
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const TEST_PHONE = '919106764653'; // Fake number for testing

async function runTest() {
  console.log(`🧪 Starting WhatsApp Bot Logic Test against: ${BASE_URL}\n`);

  // 1. Simulate Incoming Message (New User)
  console.log("1️⃣  Simulating NEW USER message...");
  try {
    await axios.post(`${BASE_URL}/webhook`, {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: TEST_PHONE,
              type: "text",
              text: { body: "What are your services?" }
            }]
          }
        }]
      }]
    });
    console.log("   ✅ Webhook received message (Check server logs for RAG reply)");
  } catch (err) {
    console.error(`   ❌ Webhook failed: ${err.message} (URL: ${BASE_URL}/webhook)`);
    if (err.code === 'ECONNREFUSED') console.error("      👉 Is the server running? (npm run dev)");
  }

  // 2. Check Database State
  console.log("\n2️⃣  Checking Database Memory...");
  try {
    const res = await axios.get(`${BASE_URL}/contact/${TEST_PHONE}`);
    const contact = res.data;
    console.log("   ✅ Contact Found:", contact.phone);
    console.log("   🧠 Last By:", contact.memory.lastBy); // Should be 'bot' if it replied
    console.log("   🤖 Bot Reply:", contact.memory.lastBotReply);
  } catch (err) {
    console.error("   ❌ Failed to fetch contact:", err.message);
  }

  // 3. Simulate Human Takeover
  console.log("\n3️⃣  Simulating HUMAN TAKEOVER...");
  try {
    await axios.post(`${BASE_URL}/memory/human`, { phone: TEST_PHONE });
    console.log("   ✅ Marked as human-replied");
  } catch (err) {
    console.error("   ❌ Failed to mark human:", err.message);
  }

  // 4. Simulate Message During Cooldown
  console.log("\n4️⃣  Simulating message during COOLDOWN...");
  try {
    await axios.post(`${BASE_URL}/webhook`, {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: TEST_PHONE,
              type: "text",
              text: { body: "Are you still there?" }
            }]
          }
        }]
      }]
    });
    console.log("   ✅ Webhook sent (Check server logs - should say 'Skipping: Human replied')");
  } catch (err) {
    console.error("   ❌ Webhook failed:", err.message);
  }
  
  console.log("\n🏁 Test Complete. Check your terminal running 'npm run dev' for the actual logic logs.");
}

runTest();
