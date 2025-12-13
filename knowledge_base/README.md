# 📚 Knowledge Base Management

This folder contains the "brain" of your WhatsApp bot.

## How to Add Knowledge

1.  Create a new `.md` (Markdown) file in this folder (e.g., `pricing.md`, `products.md`).
2.  Write your content clearly. Use headers (`#`) and bullet points.
3.  Run the ingestion script:

```bash
npm run ingest
```

This will:
1.  Read all `.md` files in `knowledge_base/`.
2.  Convert them to vectors (embeddings).
3.  Upload them to your Pinecone index.

## Updating Knowledge

If you change a file (e.g., update pricing), just run `npm run ingest` again. It will overwrite the old entry in Pinecone.
