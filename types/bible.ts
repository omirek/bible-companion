// src/types/bible.ts

export interface Verse {
  pk: number;
  verse: number;
  text: string;
}

export interface Book {
  bookid: number;
  name: string;
  chapters: number;
}

export interface UserThought {
  verse: number | null;
  content: string;
  isFavorite: boolean;
}