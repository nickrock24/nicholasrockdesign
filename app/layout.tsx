import type { Metadata } from "next";
import { IBM_Plex_Mono, Libre_Baskerville, Rethink_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const bodyFont = Libre_Baskerville({
  variable: "--font-body",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const headingFont = Rethink_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nicholas Rock",
    template: "%s — Nicholas Rock",
  },
  description: "Professional work, student work, research, and writing by Nicholas Rock.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-[1800px] flex-1 px-6 py-12 sm:px-10 lg:px-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
