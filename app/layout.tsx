import type { Metadata } from "next";
import { Nunito, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const notoMyanmar = Noto_Sans_Myanmar({
  variable: "--font-noto-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "EzEng — Learn English with Flashcards",
  description:
    "A warm, simple flashcard app for Burmese speakers learning English words, phrases, and idioms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${notoMyanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
