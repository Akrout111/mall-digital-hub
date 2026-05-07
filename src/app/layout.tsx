import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'جراند مول - المنصة الرقمية المتكاملة | Grand Mall Digital Hub',
    template: '%s | جراند مول',
  },
  description: 'منصة المول الرقمية المتكاملة - اكتشف المتاجر والعروض والخدمات | Discover shops, deals, and services at Grand Mall',
  keywords: ['مول', 'تسوق', 'عروض', 'جراند مول', 'mall', 'shopping', 'deals', 'Grand Mall', 'السعودية'],
  authors: [{ name: 'Grand Mall Digital Hub' }],
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'جراند مول - المنصة الرقمية المتكاملة',
    description: 'اكتشف المتاجر والعروض والخدمات في جراند مول',
    url: 'https://grandmall.sa',
    siteName: 'جراند مول',
    type: 'website',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'جراند مول - المنصة الرقمية المتكاملة',
    description: 'اكتشف المتاجر والعروض والخدمات في جراند مول',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
