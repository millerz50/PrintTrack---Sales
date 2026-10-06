import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Magen Integrated Business Solutions',
    short_name: 'Magen POS',
    description:
      'Commercial printing, DTF apparel transfers, school curriculum publishing, and live POS terminal in Mount Darwin, Zimbabwe.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
