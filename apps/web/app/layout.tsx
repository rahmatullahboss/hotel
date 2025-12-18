import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TopNav } from "./components/TopNav";
import { DesktopHeader } from "./components/DesktopHeader";
import { Providers } from "./providers";
import { ServiceWorkerUnregister } from "./components/ServiceWorkerUnregister";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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
  openGraph: {
    title: "Zinu Rooms - Book Verified Hotels",
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
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
