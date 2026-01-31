import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI - requires OPENAI_API_KEY env var
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });

// Helper to get embedding
async function getEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (e) {
    console.error("OpenAI Embedding Error:", e);
    return null;
  }
}

// Cosine similarity helper
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // List Notes
  app.get(api.notes.list.path, async (req, res) => {
    const notes = await storage.getNotes();
    res.json(notes);
  });

  // Get Note
  app.get(api.notes.get.path, async (req, res) => {
    const note = await storage.getNote(Number(req.params.id));
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  });

  // Create Note (Auto-embed)
  app.post(api.notes.create.path, async (req, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      
      // Generate embedding
      const embedding = await getEmbedding(`${input.title}\n${input.content}`);
      
      const note = await storage.createNote({
        ...input,
        embedding: embedding || undefined
      });
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Delete Note
  app.delete(api.notes.delete.path, async (req, res) => {
    await storage.deleteNote(Number(req.params.id));
    res.status(204).send();
  });

  // Semantic Search
  app.post(api.notes.search.path, async (req, res) => {
    try {
      const { query } = api.notes.search.input.parse(req.body);
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "OpenAI API Key missing" });
      }

      const queryEmbedding = await getEmbedding(query);
      if (!queryEmbedding) return res.status(500).json({ message: "Failed to generate embedding" });

      const notes = await storage.getNotes();
      
      const results = notes
        .filter(n => Array.isArray(n.embedding)) // Only notes with embeddings
        .map(n => ({
          ...n,
          similarity: cosineSimilarity(queryEmbedding, n.embedding as number[])
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // Top 5

      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Chat (RAG)
  app.post(api.notes.chat.path, async (req, res) => {
    try {
      const { message } = api.notes.chat.input.parse(req.body);

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "OpenAI API Key missing" });
      }

      // 1. Search for context
      const queryEmbedding = await getEmbedding(message);
      let context = "";
      
      if (queryEmbedding) {
        const notes = await storage.getNotes();
        const relevantNotes = notes
          .filter(n => Array.isArray(n.embedding))
          .map(n => ({
            ...n,
            similarity: cosineSimilarity(queryEmbedding, n.embedding as number[])
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3); // Top 3 context

        context = relevantNotes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join("\n\n");
      }

      // 2. Chat completion
      const systemPrompt = `You are a helpful assistant for a "Second Brain" app. 
      Use the following context from the user's notes to answer their question. 
      If the answer isn't in the notes, say so, but you can use general knowledge if helpful.
      
      Context:
      ${context}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Strong model for reasoning
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      });

      res.json({ answer: completion.choices[0].message.content || "No response" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Chat failed" });
    }
  });

  // Summary
  app.post(api.notes.summary.path, async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "OpenAI API Key missing" });
      }

      const notes = await storage.getNotes();
      const allContent = notes.map(n => `- ${n.title}: ${n.content.substring(0, 100)}...`).join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an AI synthesizer. Create a concise weekly summary/digest of the following notes." },
          { role: "user", content: allContent }
        ],
      });

      res.json({ summary: completion.choices[0].message.content || "No summary generated" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Summary generation failed" });
    }
  });

  return httpServer;
}
