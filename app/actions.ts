// src/app/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const TEST_USER_EMAIL = "test@example.com";

async function getUser() {
  return await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
}

// 1. ZAPISYWANIE (INTELIGENTNE)
export async function saveThought(
  bookId: string, 
  chapter: number, 
  verse: number, 
  content: string, 
  isFavorite: boolean
) {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  // Jeśli nie ma treści I nie jest ulubione -> USUŃ wpis (sprzątanie bazy)
  if (!content.trim() && !isFavorite) {
    await prisma.thought.deleteMany({
      where: {
        authorId: user.id,
        bookId,
        chapter,
        verse
      }
    });
    revalidatePath(`/read`);
    return;
  }

  // W przeciwnym razie -> UPSERT (Stwórz lub Aktualizuj)
  const existing = await prisma.thought.findFirst({
    where: {
      authorId: user.id,
      bookId: bookId,
      chapter: chapter,
      verse: verse
    }
  });

  if (existing) {
    await prisma.thought.update({
      where: { id: existing.id },
      data: { content, isFavorite }
    });
  } else {
    await prisma.thought.create({
      data: {
        content,
        isFavorite,
        bookId,
        chapter,
        verse,
        authorId: user.id,
        privacy: "PRIVATE"
      }
    });
  }

  revalidatePath(`/read`);
}

// 2. POBIERANIE (Bez zmian)
export async function getChapterThoughts(bookId: string, chapter: number) {
  const user = await getUser();
  if (!user) return []; // Zwróć pustą tablicę zamiast tworzyć usera na siłę

  return await prisma.thought.findMany({
    where: {
      authorId: user.id,
      bookId: bookId,
      chapter: chapter
    }
  });
}