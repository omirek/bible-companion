// app/read/[version]/[bookid]/[chapter]/page.tsx
import { getChapter, getBooks } from "@/lib/api";
import { getChapterThoughts } from "@/app/actions"; // <--- Import backendu
import ChapterView from "@/components/ChapterView";

interface PageProps {
  params: Promise<{
    version: string;
    bookid: string;
    chapter: string;
  }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { version, bookid, chapter } = await params;

  // Pobieramy 3 rzeczy równolegle: Tekst, Listę Ksiąg, i Notatki Użytkownika
  const [verses, books, thoughts] = await Promise.all([
    getChapter(version, bookid, chapter),
    getBooks(version),
    getChapterThoughts(bookid, parseInt(chapter))
  ]);

  return (
    <ChapterView 
      verses={verses} 
      books={books} 
      thoughts={thoughts} // <--- Przekazujemy dane
      version={version} 
      bookId={bookid} 
      chapter={chapter} 
    />
  );
}