import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ivy Homes — Mumbai Property Portal",
  description: "Audited and verified property listings, rentals, and builder projects across Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Ivy Homes Technical Assignment · Key: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">IVY26-99BAF92DE5A1</code> (Mumbai)
            </span>
            <span>
              Assigned Locality: <strong className="text-slate-800 font-semibold">Borivali West</strong>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
