// src/components/ChapterView.tsx
"use client";

import { Verse, Book, UserThought } from "@/types/bible";
import Reader from "@/components/Reader";

interface Props {
  verses: Verse[];
  books: Book[];
  thoughts: UserThought[]; // Tu nazywa się 'thoughts'
  version: string;
  bookId: string;
  chapter: string;
}

export default function ChapterView({ verses, books, thoughts, version, bookId, chapter }: Props) {
  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 md:px-8">
      <Reader 
        verses={verses} 
        bookId={bookId}      
        chapter={chapter}    
        
        // TU BYŁ BŁĄD: Mapujemy 'thoughts' na 'initialThoughts'
        initialThoughts={thoughts} 
        
        books={books}
        version={version}
      />
    </div>
  );
}