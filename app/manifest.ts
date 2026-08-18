import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Guardaroba Digitale',
    short_name: 'Closet',
    description: 'Archivio, catalogazione e abbinamento outfit locale',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0e11',
    theme_color: '#1d1d1f',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
