// src/dbEngine.ts
import Database from "better-sqlite3";
import { VerseData } from "./types";

let db: Database.Database | null = null;

/**
 * Initializes the SQLite database connection using the local `bible_kjv.db` file.
 */
export function initDatabase(dbPath: string = "./bible_kjv.db") {
  try {
    if (!db) {
      db = new Database(dbPath, { readonly: true });
      console.log("SQLite Bible Engine Connected Successfully.");
    }
  } catch (error) {
    console.error("Failed to connect to local SQLite database:", error);
  }
}

/**
 * Fetches the exact word-for-word scripture text from the database.
 */
export function getVerse(book: string, chapter: number, verse: number): VerseData | null {
  if (!db) {
    console.warn("Database not initialized, returning mock fallback.");
    return null;
  }

  try {
    // Queries common SQLite bible table schema (adjust column names if needed: book, chapter, verse, text)
    const query = db.prepare(
      "SELECT book, chapter, verse, text FROM verses WHERE LOWER(book) = LOWER(?) AND chapter = ? AND verse = ? LIMIT 1"
    );
    const result = query.get(book, chapter, verse) as VerseData | undefined;

    return result || null;
  } catch (error) {
    console.error(`Error querying scripture ${book} ${chapter}:${verse}:`, error);
    return null;
  }
}