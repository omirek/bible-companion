// src/context/PreferencesContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// SŁOWNIK TŁUMACZEŃ
const translations = {
  en: {
    library: "Library",
    community: "Community",
    profile: "Profile",
    read: "Read",
    nextChapter: "Next",
    prevChapter: "Prev",
    chapter: "Chapter",
    book: "Book",
    verse: "Verse",
    actions: "Actions",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    writeNote: "Write a Note",
    close: "Close",
    save: "Save Note",
    notePlaceholder: "Write your thoughts here...",
    selectBook: "Select Book",
    searchBook: "Search book...",
    loading: "Loading...",
  },
  pl: {
    library: "Biblioteka",
    community: "Społeczność",
    profile: "Profil",
    read: "Czytaj",
    nextChapter: "Dalej",
    prevChapter: "Wstecz",
    chapter: "Rozdział",
    book: "Księga",
    verse: "Werset",
    actions: "Akcje",
    addToFavorites: "Dodaj do ulubionych",
    removeFromFavorites: "Usuń z ulubionych",
    writeNote: "Napisz notatkę",
    close: "Zamknij",
    save: "Zapisz notatkę",
    notePlaceholder: "Wpisz swoje przemyślenia tutaj...",
    selectBook: "Wybierz Księgę",
    searchBook: "Szukaj księgi...",
    loading: "Ładowanie...",
  }
};

type Language = "en" | "pl";
type TranslationKey = keyof typeof translations.en;

interface PreferencesContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  bibleVersion: string;
  setBibleVersion: (ver: string) => void;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [bibleVersion, setBibleVersionState] = useState<string>("KJV");
  const [mounted, setMounted] = useState(false);

  // 1. Ładowanie ustawień przy starcie
  useEffect(() => {
    const savedLang = localStorage.getItem("app_lang") as Language;
    const savedVer = localStorage.getItem("app_version");
    
    if (savedLang) setLanguageState(savedLang);
    if (savedVer) setBibleVersionState(savedVer);
    setMounted(true);
  }, []);

  // 2. Zapisywanie języka
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  // 3. Zapisywanie wersji Biblii
  const setBibleVersion = (ver: string) => {
    setBibleVersionState(ver);
    localStorage.setItem("app_version", ver);
  };

  const t = (key: TranslationKey) => {
    return translations[language][key] || key;
  };

  // Zapobiegamy "Hydration Mismatch" renderując dzieci dopiero po załadowaniu ustawień
  if (!mounted) return <div className="p-10">Loading...</div>;

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, bibleVersion, setBibleVersion, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used within Provider");
  return context;
}