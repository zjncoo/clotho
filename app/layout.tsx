import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Closet App',
  description: 'Guardaroba digitale e studio outfit',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Closet',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
