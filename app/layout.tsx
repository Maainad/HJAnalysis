import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "تحليل الطلب في حراج",
  description: "لوحة تحكم لتحليل الطلب في موقع حراج",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
