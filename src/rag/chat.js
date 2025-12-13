import { retrieveContext, getPineconeClient } from "./retriever.js";

export async function chatWithAI(userQuery, contactType = "customer", history = []) {
  const pc = getPineconeClient();

  // 1. Embed user query
  let queryVector;
  try {
    const embeddingResult = await pc.inference.embed(
      "llama-text-embed-v2",
      [userQuery],
      { inputType: 'query' }
    );
    queryVector = embeddingResult.data[0].values;
  } catch (err) {
    console.error("Embedding error:", err);
    // Proceed without context if embedding fails, or throw. 
    // For a robust bot, we might want to fallback to just chat.
    queryVector = null; 
  }

  // 2. Retrieve relevant context (if vector exists)
  const context = queryVector ? await retrieveContext(queryVector) : "";

  // 3. Define Persona based on Contact Type
  let personaInstructions = "";
  switch (contactType) {
    case "bff": // GF
      personaInstructions = `
You are talking to my girlfriend (my love). 
- Be extremely lovely, romantic, caring, and sweet. 
- Use emojis like ❤️, 😘, 🌹. 
- If she asks where I am, say "He is working hard for our future, baby."
- Never be formal. Be intimate and warm.
`;
      break;
    case "friend":
      personaInstructions = `
You are talking to a close friend. 
- Be casual, chill, and use slang (bro, dude, yaar). 
- Don't be too salesy unless they specifically ask for business help.
`;
      break;
    case "family":
      personaInstructions = `
You are talking to a family member. 
- Be respectful, warm, and caring. 
- Ask about their health/well-being.
`;
      break;
    case "customer":
    default:
      personaInstructions = `
You are Rex, the AI Automation Specialist for Automation AI.
- Be professional, persuasive, and helpful.
- Your goal is to SELL automation services.
- If they ask "Hi" or "How are you", briefly greet them and ask how you can help their business.
`;
      break;
  }

  // 4. Create System Prompt
  const systemPrompt = `
${personaInstructions}

LANGUAGE & STYLE INSTRUCTIONS:
- **Detect the user's language** from their message and history (English, Hindi, Gujarati, or Hinglish).
- **Reply in the SAME language and script**.
- If they use **Hinglish** (e.g., "kya kar raha hai"), reply in **Hinglish**.
- If they use **Gujarati** (e.g., "kem cho"), reply in **Gujarati**.
- Use the provided CONTEXT to answer business questions.
- If the answer is not in the context:
  - For "customer": Say you can build a custom solution for that.
  - For "bff"/"friend": Chat naturally.

CONTEXT:
${context}
  `;

  // 5. Format History for API
  // Take last 10 messages to fit context window
  const recentHistory = history.slice(-10).map(msg => ({
    role: msg.role === 'bot' ? 'assistant' : 'user',
    content: msg.content
  }));

  // 6. Call OpenRouter
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPEN_ROUTER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "nex-agi/deepseek-v3.1-nex-n1:free",
      "messages": [
        { "role": "system", "content": systemPrompt },
        ...recentHistory,
        { "role": "user", "content": userQuery }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API Error: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
