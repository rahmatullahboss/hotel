import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TopNav } from "./components/TopNav";
import { DesktopHeader } from "./components/DesktopHeader";
import { Providers } from "./providers";
import { ServiceWorkerUnregister } from "./components/ServiceWorkerUnregister";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ScrollToTop } from "./components/ScrollToTop";
import { CookieConsent } from "./components/CookieConsent";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Zinu Rooms - Book Verified Hotels",
  description:
    "Book quality-assured hotels across Bangladesh. Verified properties, secure payments, 24/7 support.",
  metadataBase: new URL("https://zinurooms.com"),
  openGraph: {
    title: "Zinu Rooms - Book Verified Hotels",
    description:
      "Find and book clean, verified hotels across Bangladesh at the best prices. Quality-assured stays with 24/7 support.",
    type: "website",
    siteName: "ZinuRooms",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZinuRooms - Book Verified Hotels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zinu Rooms - Book Verified Hotels",
    description:
      "Find and book clean, verified hotels across Bangladesh at the best prices.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  keywords: [
    "hotel booking",
    "Bangladesh hotels",
    "verified hotels",
    "ZinuRooms",
    "budget hotels",
    "premium stays",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1D3557",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ServiceWorkerUnregister />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <DesktopHeader />
            <TopNav />
            {children}
            <ScrollToTop />
            <CookieConsent />
            <PWAInstallPrompt />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
