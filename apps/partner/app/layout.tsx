import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { auth } from "../auth";
import { getPartnerHotel, getAllPartnerHotels } from "./actions/dashboard";
import { getPartnerRole } from "./actions/getPartnerRole";
import { PartnerHeader } from "./components/PartnerHeader";
import { OyoSidebar, BottomNav } from "./components";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "ZinuRooms Manager - Partner Dashboard",
  description: "Manage your hotel inventory, bookings, and earnings",
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
  const session = await auth();

  // Fetch initial data for layout if user is logged in
  let hotel = null;
  let allHotels: any[] = [];
  let currentRole = "RECEPTIONIST";

  if (session?.user) {
    try {
      [hotel, allHotels] = await Promise.all([
        getPartnerHotel(),
        getAllPartnerHotels(),
      ]);
      const roleInfo = await getPartnerRole();
      currentRole = roleInfo?.role ?? "RECEPTIONIST";
    } catch (e) {
      console.error("Layout data fetch error:", e);
    }
  }

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            {/* Global Layout Wrapper */}
            {hotel && session?.user ? (
              <div className="oyo-layout">
                {/* Global Header */}
                <PartnerHeader
                  user={session.user}
                  hotel={hotel}
                  allHotels={allHotels}
                />

                {/* Body Container (Sidebar + Main) */}
                <div className="oyo-body">
                  {/* Desktop Sidebar (Left) */}
                  <OyoSidebar hotelName={hotel.name} className="hidden lg:block" />

                  {/* Main Content Area */}
                  <main className="oyo-main">
                    {children}
                  </main>
                </div>

                {/* Mobile Bottom Nav */}
                <BottomNav role={currentRole as any} className="hide-on-desktop" />
              </div>
            ) : (
              // Fallback for auth pages or un-onboarded users
              <>{children}</>
            )}
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
