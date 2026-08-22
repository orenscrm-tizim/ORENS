import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORENS - Do'kon boshqaruvi",
  description: "Retail biznesini boshqarish platformasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-50`}>
      <body className="flex h-full min-h-full overflow-hidden text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
