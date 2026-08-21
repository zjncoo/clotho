import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import SplashScreen from '@/components/SplashScreen';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0e11' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Clotho | Digital Wardrobe & Outfit Studio',
  description: 'Organize your closet and craft perfect outfits locally',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clotho',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased font-sans min-h-screen bg-[#f5f7fa] dark:bg-[#0d0e11] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <ThemeProvider>
          <SplashScreen />
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
