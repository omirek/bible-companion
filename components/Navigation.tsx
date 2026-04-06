// src/components/Navigation.tsx
"use client";

import { useState } from "react";
import { Book } from "@/types/bible";
import { usePreferences } from "@/context/PreferencesContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  books: Book[];
  currentBookId: string;
  currentChapter: string;
  version: string;
}

export default function Navigation({ books, currentBookId, currentChapter, version }: Props) {
  const { t, setBibleVersion } = usePreferences();
  const router = useRouter();
  
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isChapterOpen, setIsChapterOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false); // Nowy stan

  const currentBook = books.find(b => b.bookid.toString() === currentBookId);

  // Zmiana wersji przekierowuje na ten sam rozdział w innym języku
  const handleVersionChange = (newVersion: string) => {
    setBibleVersion(newVersion); // Aktualizuj globalny stan
    setIsVersionOpen(false);
    router.push(`/read/${newVersion}/${currentBookId}/${currentChapter}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm mb-6">
      
      <div className="flex gap-2 relative">
        
        {/* 1. DROPDOWN WERSJI (NOWY) */}
        <div className="relative">
          <button 
            onClick={() => { setIsVersionOpen(!isVersionOpen); setIsBookOpen(false); setIsChapterOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-accent hover:bg-slate-200 transition-colors"
          >
            <span>{version}</span>
            <span className="text-xs opacity-50">▼</span>
          </button>

          {isVersionOpen && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button onClick={() => handleVersionChange("KJV")} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">English (KJV)</button>
              <button onClick={() => handleVersionChange("BW")} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Polski (BW)</button>
            </div>
          )}
        </div>

        {/* 2. DROPDOWN KSIĘGI */}
        <div className="relative">
          <button 
            onClick={() => { setIsBookOpen(!isBookOpen); setIsVersionOpen(false); setIsChapterOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors min-w-[140px] justify-between"
          >
            <span>{currentBook ? currentBook.name : t("selectBook")}</span>
            <span className="text-xs text-slate-400">▼</span>
          </button>

          {isBookOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50">
              <div className="text-xs font-bold text-slate-400 uppercase px-2 py-1 mb-1">{t("searchBook")}</div>
              {books.map((book) => (
                <button
                  key={book.bookid}
                  onClick={() => { setIsBookOpen(false); router.push(`/read/${version}/${book.bookid}/1`); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    book.bookid.toString() === currentBookId 
                      ? "bg-orange-50 text-accent font-bold" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. DROPDOWN ROZDZIAŁU */}
        <div className="relative">
          <button 
            onClick={() => { setIsChapterOpen(!isChapterOpen); setIsBookOpen(false); setIsVersionOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <span className="text-slate-400 font-normal">{t("chapter")}</span>
            <span>{currentChapter}</span>
            <span className="text-xs text-slate-400">▼</span>
          </button>

          {isChapterOpen && currentBook && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50">
               <div className="grid grid-cols-6 gap-2">
                 {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((ch) => (
                   <Link
                     key={ch}
                     href={`/read/${version}/${currentBookId}/${ch}`}
                     onClick={() => setIsChapterOpen(false)}
                     className={`flex items-center justify-center p-2 rounded-lg text-sm font-mono transition-colors ${
                       ch.toString() === currentChapter
                         ? "bg-orange-500 text-white shadow-md"
                         : "bg-slate-50 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 dark:text-slate-300"
                     }`}
                   >
                     {ch}
                   </Link>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-2 md:mt-0">
        <Link 
          href={`/read/${version}/${currentBookId}/${Math.max(1, parseInt(currentChapter) - 1)}`}
          className={`px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 ${currentChapter === "1" ? "opacity-50 pointer-events-none" : ""}`}
        >
          ←
        </Link>
        <Link 
          href={`/read/${version}/${currentBookId}/${parseInt(currentChapter) + 1}`}
          className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
        >
          →
        </Link>
      </div>
    </div>
  );
}