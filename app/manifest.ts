import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Clotho | Digital Wardrobe',
    short_name: 'Clotho',
    description: 'Local wardrobe management and outfit creation studio',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0e11',
    theme_color: '#0d0e11',
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
