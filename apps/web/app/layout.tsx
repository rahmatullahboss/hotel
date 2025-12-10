import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TopNav } from "./components/TopNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Vibe - Book Verified Hotels",
  description: "Find and book clean, verified hotels at the best prices. 3-click booking, pay at hotel option available.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vibe",
  },
  openGraph: {
    title: "Vibe - Book Verified Hotels",
    description: "Find and book clean, verified hotels at the best prices.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1D3557",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TopNav />
        {children}
      </body>
    </html>
  );
}

