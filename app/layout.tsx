// app/layout.tsx
import type { Metadata } from "next";
// ZMIANA: Importujemy Frank_Ruhl_Libre
import { Inter, Merriweather, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { PreferencesProvider } from "@/context/PreferencesContext";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const merriweather = Merriweather({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700"], 
  variable: "--font-serif" 
});

// ZMIANA: Konfiguracja Frank Ruhl Libre
const frank = Frank_Ruhl_Libre({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700"],
  variable: "--font-biblical" // Nazwijmy ją semantycznie "biblical"
});

export const metadata: Metadata = {
  title: "Bible Companion",
  description: "Social Bible Reading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Dodajemy frank.variable */}
      <body className={`${inter.variable} ${merriweather.variable} ${frank.variable} font-sans antialiased`}>
        <PreferencesProvider>
          <div className="flex min-h-screen bg-background text-primary">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8">
              {children}
            </main>
          </div>
        </PreferencesProvider>
      </body>
    </html>
  );
}