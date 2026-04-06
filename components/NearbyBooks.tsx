// src/components/NearbyBooks.tsx
import Link from "next/link";
import { Book } from "@/types/bible";

interface Props {
  currentBookId: number; // np. 1 (Genesis)
  books: Book[];
  version: string;
}

export default function NearbyBooks({ currentBookId, books, version }: Props) {
  // Znajdź indeks obecnej księgi
  const currentIndex = books.findIndex((b) => b.bookid === currentBookId);
  
  if (currentIndex === -1) return null;

  // Pobierz 2 księgi przed i 2 po (w sumie 5)
  const start = Math.max(0, currentIndex - 2);
  const end = Math.min(books.length, currentIndex + 3);
  const neighbors = books.slice(start, end);

  return (
    <div className="flex justify-center gap-2 mb-6 text-xs uppercase tracking-widest text-slate-400">
      {neighbors.map((book) => {
        const isActive = book.bookid === currentBookId;
        return (
          <Link
            key={book.bookid}
            href={`/read/${version}/${book.bookid}/1`}
            className={`
              hover:text-orange-500 transition-colors
              ${isActive ? "text-orange-600 font-bold border-b-2 border-orange-500" : ""}
            `}
          >
            {book.name}
          </Link>
        );
      })}
    </div>
  );
}