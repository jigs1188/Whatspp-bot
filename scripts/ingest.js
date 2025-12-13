import fs from "fs";
import { glob } from "glob";
import matter from "gray-matter";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index(process.env.PINECONE_INDEX || 'automationai');

async function embedDocuments() {
  console.log("🔍 Scanning knowledge_base for .md files...");
  
  // Find all markdown files in knowledge_base
  const files = await glob("knowledge_base/*.md");
  
  if (files.length === 0) {
    console.log("⚠️ No markdown files found in knowledge_base/");
    return;
  }

  console.log(`Found ${files.length} files. Starting embedding...`);

  for (let file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { content } = matter(raw);
    
    if (!content.trim()) {
      console.log(`Skipping empty file: ${file}`);
      continue;
    }

    try {
      console.log(`Embedding ${file}...`);
      
      // Use Pinecone Inference API (same as in chat.js)
      const embeddingResult = await pc.inference.embed(
        "llama-text-embed-v2",
        [content],
        { inputType: 'passage' }
      );
      const vector = embeddingResult.data[0].values;

      // Upsert to Pinecone
      // ID is the filename to allow overwriting updates
      await index.upsert([
        {
          id: path.basename(file),
          values: vector,
          metadata: { 
            text: content,
            source: file,
            updatedAt: new Date().toISOString()
          }
        }
      ]);
      
      console.log(`✅ Successfully embedded: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to embed ${file}:`, error.message);
    }
  }

  console.log("🎉 Knowledge base ingestion complete!");
}

embedDocuments();
