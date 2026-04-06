// src/lib/api.ts
import { Verse } from "@/types/bible";

const API_BASE = "https://bolls.life";

// 1. Helper to fetch the list of books (So we don't guess IDs)
export async function getBooks(version: string) {
  const response = await fetch(`${API_BASE}/get-books/${version}/`);
  if (!response.ok) throw new Error("Failed to fetch books");
  return response.json();
}

// 2. Helper to fetch a chapter and CLEAN the text
export async function getChapter(version: string, bookId: string, chapter: string): Promise<Verse[]> {
  const response = await fetch(`${API_BASE}/get-text/${version}/${bookId}/${chapter}/`);
  
  if (!response.ok) throw new Error("Failed to fetch chapter");

  const data = await response.json();

  // CLEANING LOGIC:
  // The API returns HTML like "In the beginning <S>123</S>..."
  // We use Regex to strip anything that looks like <...>
  return data.map((item: any) => ({
    pk: item.pk,
    verse: item.verse,
    text: item.text
      .replace(/<S>\d+<\/S>/g, "") // Remove Strong's numbers specifically
      .replace(/<[^>]+>/g, "")     // Remove any remaining HTML tags (like <br> or <i>)
      .replace(/\s+/g, " ")        // Fix weird double spaces left behind
      .trim()
  }));
}