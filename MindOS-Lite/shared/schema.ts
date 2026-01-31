import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Store embedding as a JSON array of numbers. 
  // In a real production app with pgvector, this would be vector(1536).
  // For 'Lite', jsonb is fine for small datasets.
  embedding: jsonb("embedding"), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({ 
  id: true, 
  createdAt: true, 
  embedding: true // Backend generates this
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type CreateNoteRequest = InsertNote;
export type UpdateNoteRequest = Partial<InsertNote>;

// Search/Chat types
export const searchSchema = z.object({
  query: z.string(),
});

export const chatSchema = z.object({
  message: z.string(),
});

export interface SearchResult extends Note {
  similarity: number;
}

export interface ChatResponse {
  answer: string;
}

export interface SummaryResponse {
  summary: string;
}
