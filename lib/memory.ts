import { Memory } from "mem0ai/oss";

let memory: Memory | undefined;

export function getMemory(): Memory {
  if (memory) return memory;

  memory = new Memory({
    llm: {
      provider: "gemini",
      config: {
        apiKey: process.env.GOOGLE_API_KEY,
        model: process.env.GEMINI_MODEL,
      },
    },
    embedder: {
      provider: "openai",
      config: {
        apiKey: process.env.GOOGLE_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        model: "gemini-embedding-2",
        embeddingDims: 768,
      },
    },
    vectorStore: {
      provider: "qdrant",
      config: {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "healthcare_memories_embedding2",
        dimension: 768,
      },
    },
    disableHistory: true,
  });

  return memory;
}
