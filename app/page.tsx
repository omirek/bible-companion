// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getBooks } from "@/lib/api";
import { Book } from "@/types/bible";
import Link from "next/link";
// IMPORTUJEMY CONTEXT
import { usePreferences } from "@/context/PreferencesContext";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ZAMIANA: Używamy globalnego stanu zamiast useState("KJV")
  const { bibleVersion, setBibleVersion, t } = usePreferences();

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      try {
        const data = await getBooks(bibleVersion);
        setBooks(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [bibleVersion]); // Odśwież jak zmieni się globalna wersja

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("library")}</h1>
          <p className="text-slate-500">{t("selectBook")}</p>
        </div>
        
        {/* Przełącznik Wersji (korzysta z globalnego settera) */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setBibleVersion("KJV")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              bibleVersion === "KJV" ? "bg-white dark:bg-slate-700 shadow-sm text-orange-600" : "text-slate-500"
            }`}
          >
            English (KJV)
          </button>
          <button
            onClick={() => setBibleVersion("BW")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              bibleVersion === "BW" ? "bg-white dark:bg-slate-700 shadow-sm text-orange-600" : "text-slate-500"
            }`}
          >
            Polski (BW)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-50">{t("loading")}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <Link
              key={book.bookid}
              // Używamy bibleVersion z kontekstu
              href={`/read/${bibleVersion}/${book.bookid}/1`}
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-orange-500 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200 group-hover:text-accent">
                  {book.name}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {book.chapters}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}