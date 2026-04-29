import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lo-Carb GGE Dashboard",
  description:
    "Explore greenhouse gas emissions by country, gas, sector, and year.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full m-0">
        <Providers>
          <div className="flex flex-col min-h-full">
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
