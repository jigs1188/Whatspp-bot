import { Pinecone } from '@pinecone-database/pinecone';

let pc;
let index;

function initPinecone() {
  if (!pc) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is missing");
    }
    pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    index = pc.Index(process.env.PINECONE_INDEX || 'automationai');
  }
  return { pc, index };
}

export async function retrieveContext(queryVector) {
  const { index } = initPinecone();
  
  try {
    const result = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true
    });

    return result.matches.map(m => m.metadata?.text || "").join("\n\n");
  } catch (err) {
    console.error("Pinecone retrieval error:", err);
    return "";
  }
}

export function getPineconeClient() {
  return initPinecone().pc;
}
