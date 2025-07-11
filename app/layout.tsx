import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.scss";
import { FiltersProvider } from "@/context/FiltersContext";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Prime2Place",
  description: "Prime2Place",
  icons: {
    icon: "/logoW.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <FiltersProvider>{children}</FiltersProvider>
      </body>
    </html>
  );
}
