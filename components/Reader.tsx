// src/components/Reader.tsx
"use client";

import { Verse, UserThought, Book } from "@/types/bible";
import { useState, useEffect, useRef } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import { saveThought } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ReaderProps {
  verses: Verse[];
  bookId: string;
  chapter: string;
  initialThoughts: UserThought[];
  books: Book[];
  version: string;
}

const VERSIONS = [
  { code: "KJV", label: "English (KJV)" },
  { code: "BW", label: "Polski (Warszawska)" },
];

export default function Reader({ verses, bookId, chapter, initialThoughts, books, version }: ReaderProps) {
  const { t, setBibleVersion } = usePreferences();
  const router = useRouter();

  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [thoughts, setThoughts] = useState<UserThought[]>(initialThoughts);
  const [noteText, setNoteText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBookSelectOpen, setIsBookSelectOpen] = useState(false);
  const [isChapterSelectOpen, setIsChapterSelectOpen] = useState(false);
  const [isVersionSelectOpen, setIsVersionSelectOpen] = useState(false);

  const currentBook = books.find(b => b.bookid.toString() === bookId);
  const currentChapterNum = parseInt(chapter);
  const currentVersionLabel = VERSIONS.find(v => v.code === version)?.label || version;

  const chapterDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chapterDropdownRef.current && !chapterDropdownRef.current.contains(event.target as Node)) {
        setIsChapterSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const targetVerse = activeVerse === null ? 0 : activeVerse;
    const existing = thoughts.find(t => t.verse === targetVerse);
    setNoteText(existing?.content || "");
    setIsFavorite(existing?.isFavorite || false);
  }, [activeVerse, thoughts]);

  const updateLocalState = (verse: number, content: string, favorite: boolean) => {
    setThoughts(prev => {
      const filtered = prev.filter(t => t.verse !== verse);
      if (!content.trim() && !favorite) return filtered;
      return [...filtered, { verse, content, isFavorite: favorite }];
    });
  };

  const handleSave = async (forceFavorite?: boolean) => {
    const targetVerse = activeVerse === null ? 0 : activeVerse;
    const finalFavorite = forceFavorite !== undefined ? forceFavorite : isFavorite;
    const finalContent = noteText; 
    setIsSaving(true);
    updateLocalState(targetVerse, finalContent, finalFavorite);
    try {
      await saveThought(bookId, parseInt(chapter), targetVerse, finalContent, finalFavorite);
    } catch (e) { console.error(e); alert("Błąd zapisu"); } 
    finally { setIsSaving(false); }
  };

  const toggleFavorite = () => {
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    handleSave(newStatus);
  };
  const handleSaveButton = () => handleSave();
  const handleDeleteNote = async () => {
    const confirmDelete = confirm("Usunąć?");
    if (!confirmDelete) return;
    setNoteText("");
    const targetVerse = activeVerse === null ? 0 : activeVerse;
    setIsSaving(true);
    try {
      await saveThought(bookId, parseInt(chapter), targetVerse, "", isFavorite);
      updateLocalState(targetVerse, "", isFavorite);
    } catch (e) { alert("Błąd usuwania"); }
    finally { setIsSaving(false); }
  };
  const handleBookChange = (newBookId: number) => {
    router.push(`/read/${version}/${newBookId}/1`);
    setIsBookSelectOpen(false);
  };
  const handleVersionChange = (newVersion: string) => {
    setBibleVersion(newVersion);
    router.push(`/read/${newVersion}/${bookId}/${chapter}`);
    setIsVersionSelectOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 relative items-start mt-8">
      
      {/* 1. LEWA KOLUMNA */}
      <div className="lg:flex-1 w-full">
        
        {/* NAGŁÓWEK ROZDZIAŁU (Zmieniony Design) */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-12 relative">
          
          {currentChapterNum > 1 ? (
            <Link 
              href={`/read/${version}/${bookId}/${currentChapterNum - 1}`}
              className="w-12 h-12 flex items-center justify-center rounded-full text-muted hover:text-primary hover:bg-subtle transition-all duration-200 text-2xl pb-1"
            >
              &lt;
            </Link>
          ) : <div className="w-12" />}

          <div className="relative" ref={chapterDropdownRef}>
            <button 
              onClick={() => setIsChapterSelectOpen(!isChapterSelectOpen)}
              // TOOLTIP:
              title="Kliknij, aby wybrać rozdział"
              // PILL DESIGN:
              className={`
                group relative px-8 py-3 rounded-full transition-all duration-300
                flex items-center gap-3
                text-2xl md:text-3xl font-biblical
                /* Tło i obramowanie w stylu "Pill" */
                bg-subtle/50 hover:bg-subtle border border-transparent hover:border-dim
              `}
            >
              <span className="font-bold text-primary">{currentBook?.name}</span>
              <span className="font-bold text-accent">{chapter}</span>
            </button>

            {isChapterSelectOpen && currentBook && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-surface border border-dim rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="text-xs font-bold text-muted uppercase text-center mb-3">
                  Wybierz rozdział
                </div>
                <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <Link
                      key={ch}
                      href={`/read/${version}/${bookId}/${ch}`}
                      onClick={() => setIsChapterSelectOpen(false)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-colors
                        ${ch === currentChapterNum 
                          ? "bg-accent text-inverse" 
                          : "bg-subtle text-secondary hover:bg-dim"}
                      `}
                    >
                      {ch}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link 
            href={`/read/${version}/${bookId}/${currentChapterNum + 1}`}
            className="w-12 h-12 flex items-center justify-center rounded-full text-muted hover:text-primary hover:bg-subtle transition-all duration-200 text-2xl pb-1"
          >
            &gt;
          </Link>
        </div>


        {/* TREŚĆ WERSETÓW */}
        <div className="space-y-4 font-serif text-lg leading-loose text-primary text-justify">
          {verses.map((v) => {
            const isActive = activeVerse === v.verse;
            const hasThought = thoughts.find(t => t.verse === v.verse);
            const hasHeart = hasThought?.isFavorite;
            const hasNote = hasThought?.content && hasThought.content.length > 0;

            return (
              <span
                id={`v-${v.verse}`}
                key={v.pk}
                onClick={() => setActiveVerse(isActive ? null : v.verse)}
                className={`
                  relative px-1 rounded transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-accent-light outline outline-2 outline-accent box-decoration-clone" 
                    : "hover:bg-subtle"}
                `}
              >
                <sup className="text-xs text-muted font-sans mr-1 select-none font-bold">
                  {v.verse}
                </sup>
                
                {(hasHeart || hasNote) && (
                   <span className="absolute -top-2 -right-1 flex gap-0.5 pointer-events-none">
                     {hasHeart && <span className="text-[10px]">❤️</span>}
                     {hasNote && <span className="text-[10px]">📝</span>}
                   </span>
                )}

                {v.text}{" "}
              </span>
            );
          })}
        </div>
      </div>


      {/* 2. PRAWA KOLUMNA - SIDEBAR */}
      <div className="hidden lg:flex w-80 sticky top-10 flex-col gap-6">
        
        {/* NAWIGACJA */}
        <div className="bg-surface border border-dim rounded-2xl p-4 shadow-sm relative space-y-3">
           <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">
             Nawigacja
           </label>
           
           <div className="relative">
             <button 
               onClick={() => setIsVersionSelectOpen(!isVersionSelectOpen)}
               className="w-full flex justify-between items-center bg-subtle hover:bg-dim text-secondary px-4 py-2 rounded-lg transition-colors text-sm font-medium"
             >
               <span>{currentVersionLabel}</span>
               <span className="text-xs opacity-50">▼</span>
             </button>

             {isVersionSelectOpen && (
               <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-dim rounded-xl shadow-xl z-50 p-1">
                 {VERSIONS.map((v) => (
                   <button
                     key={v.code}
                     onClick={() => handleVersionChange(v.code)}
                     className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                       v.code === version 
                         ? "bg-accent-light text-accent font-bold" 
                         : "text-secondary hover:bg-subtle"
                     }`}
                   >
                     {v.label}
                   </button>
                 ))}
               </div>
             )}
           </div>

           <div className="relative">
             <button 
               onClick={() => setIsBookSelectOpen(!isBookSelectOpen)}
               className="w-full flex justify-between items-center bg-subtle hover:bg-bg-inverse hover:text-inverse text-primary px-4 py-2 rounded-lg transition-colors font-bold text-sm"
             >
               <span>{currentBook?.name}</span>
               <span className="text-xs opacity-50">▼</span>
             </button>

             {isBookSelectOpen && (
               <div className="absolute top-full left-0 mt-2 w-full max-h-80 overflow-y-auto bg-surface border border-dim rounded-xl shadow-xl z-50 p-2">
                 {books.map((b) => (
                   <button
                     key={b.bookid}
                     onClick={() => handleBookChange(b.bookid)}
                     className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                       b.bookid.toString() === bookId 
                         ? "bg-accent-light text-accent font-bold" 
                         : "text-secondary hover:bg-subtle"
                     }`}
                   >
                     {b.name}
                   </button>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* PANEL AKCJI / NOTATEK */}
        <div className="bg-surface border border-dim rounded-2xl p-6 shadow-sm transition-all duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-dim pb-4">
             {activeVerse ? (
               <h3 className="font-bold text-lg text-secondary flex items-center gap-2 animate-in fade-in">
                 <span className="bg-accent-light text-accent text-xs px-2 py-1 rounded-full font-mono">
                   #{activeVerse}
                 </span>
                 {t("actions")}
               </h3>
             ) : (
               <h3 className="font-bold text-lg text-primary flex items-center gap-2 animate-in fade-in">
                 <span className="text-xl">📖</span> Refleksje
               </h3>
             )}
             
             {activeVerse && (
               <button onClick={() => setActiveVerse(null)} className="text-muted hover:text-secondary">✕</button>
             )}
          </div>

          <div className="space-y-4">
            <button 
              onClick={toggleFavorite}
              className={`w-full flex items-center justify-center gap-2 py-3 border rounded-xl transition-all font-medium ${
                isFavorite 
                  ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200" 
                  : "bg-surface text-secondary border-dim hover:border-rose-300 hover:text-rose-500"
              }`}
            >
              <span>{isFavorite ? "❤️" : "🤍"}</span> 
              {activeVerse 
                ? (isFavorite ? t("removeFromFavorites") : t("addToFavorites"))
                : (isFavorite ? "Usuń rozdział z ulubionych" : "Dodaj rozdział do ulubionych")
              }
            </button>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                  {activeVerse ? t("writeNote") : "Notatka do rozdziału"}
                </label>
                {noteText.length > 0 && (
                  <button 
                    onClick={handleDeleteNote}
                    className="text-xs text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1"
                    title="Usuń treść notatki"
                  >
                    🗑️ Usuń
                  </button>
                )}
              </div>
              
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full h-64 p-3 bg-subtle text-secondary border border-dim rounded-xl focus:ring-2 focus:ring-accent outline-none resize-none text-sm leading-relaxed"
                placeholder={activeVerse 
                  ? t("notePlaceholder") 
                  : "Jakie są Twoje przemyślenia na temat tego rozdziału?"}
              />
              
              <button 
                onClick={handleSaveButton}
                disabled={isSaving}
                className="mt-3 w-full py-2 bg-bg-inverse text-inverse rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSaving ? "Zapisywanie..." : t("save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}