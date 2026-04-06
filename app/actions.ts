// src/app/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Not authenticated");
  return await prisma.user.findUnique({ where: { email: session.user.email } });
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

// Friendship actions
export async function sendFriendRequest(receiverEmail: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
  if (!receiver) throw new Error("User not found");

  if (user.id === receiver.id) throw new Error("Cannot send request to yourself");

  // Check if request already exists
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: user.id }
      ]
    }
  });

  if (existing) throw new Error("Friendship request already exists");

  await prisma.friendship.create({
    data: {
      senderId: user.id,
      receiverId: receiver.id,
      status: "PENDING"
    }
  });

  revalidatePath("/community");
}

export async function acceptFriendRequest(senderId: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await prisma.friendship.updateMany({
    where: {
      senderId,
      receiverId: user.id,
      status: "PENDING"
    },
    data: { status: "ACCEPTED" }
  });

  revalidatePath("/community");
}

export async function declineFriendRequest(senderId: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await prisma.friendship.deleteMany({
    where: {
      senderId,
      receiverId: user.id,
      status: "PENDING"
    }
  });

  revalidatePath("/community");
}

export async function setFriendLevel(friendId: string, level: "REGULAR" | "CLOSE") {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await prisma.friendship.updateMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: friendId },
        { senderId: friendId, receiverId: user.id }
      ],
      status: "ACCEPTED"
    },
    data: { level }
  });

  revalidatePath("/community");
}

export async function getFriends() {
  const user = await getUser();
  if (!user) return { friends: [], pendingSent: [], pendingReceived: [] };

  const sentRequests = await prisma.friendship.findMany({
    where: { senderId: user.id },
    include: { receiver: true }
  });

  const receivedRequests = await prisma.friendship.findMany({
    where: { receiverId: user.id },
    include: { sender: true }
  });

  const friends = receivedRequests.filter(r => r.status === "ACCEPTED").map(r => ({ ...r.sender, level: r.level }));
  const pendingSent = sentRequests.filter(r => r.status === "PENDING").map(r => r.receiver);
  const pendingReceived = receivedRequests.filter(r => r.status === "PENDING").map(r => r.sender);

  return { friends, pendingSent, pendingReceived };
}