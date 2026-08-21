import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import SplashScreen from '@/components/SplashScreen';
import AppShell from '@/components/AppShell';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0d10' },
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
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icons/icon-dark.svg" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased font-sans text-[#121316] dark:text-[#f8fafc]">
        <ThemeProvider>
          {/* Fixed Ambient Background Layer for all iOS screens */}
          <div className="fixed-app-background" />
          <SplashScreen />
          <Navbar />
          <AppShell>
            <main>{children}</main>
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
