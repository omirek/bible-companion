// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// ZMIANA: Importujemy usePreferences zamiast useLanguage
import { usePreferences } from "@/context/PreferencesContext"; 

export default function Sidebar() {
  const pathname = usePathname();
  
  // ZMIANA: Pobieramy dane z nowego kontekstu
  const { t, language, setLanguage } = usePreferences();

  const navItems = [
    { name: t("library"), href: "/", icon: "📖" },
    { name: t("community"), href: "/community", icon: "👥" },
    { name: t("profile"), href: "/profile", icon: "👤" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 hidden md:flex flex-col justify-between z-50">
      <div>
        <div className="mb-8 pl-2">
          <h1 className="text-2xl font-bold text-accent">Bible Social</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-orange-500 text-white shadow-md" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Przełącznik Języka na dole paska */}
      <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
        <button 
          onClick={() => setLanguage("en")}
          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
            language === 'en' 
              ? 'bg-white dark:bg-slate-600 text-orange-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          English
        </button>
        <button 
          onClick={() => setLanguage("pl")}
          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
            language === 'pl' 
              ? 'bg-white dark:bg-slate-600 text-orange-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Polski
        </button>
      </div>
    </aside>
  );
}