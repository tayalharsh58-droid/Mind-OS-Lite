import { db } from "./db";
import { notes, type InsertNote, type Note } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote & { embedding?: number[] }): Promise<Note>;
  deleteNote(id: number): Promise<void>;
  updateNote(id: number, updates: Partial<InsertNote> & { embedding?: number[] }): Promise<Note | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async createNote(insertNote: InsertNote & { embedding?: number[] }): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async updateNote(id: number, updates: Partial<InsertNote> & { embedding?: number[] }): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set(updates)
      .where(eq(notes.id, id))
      .returning();
    return note;
  }
}

export const storage = new DatabaseStorage();
