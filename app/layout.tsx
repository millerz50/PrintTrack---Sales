
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://your-domain.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Magen Integrated Business Solutions (MIBS) | Commercial Print & Media | Mount Darwin',
    template: '%s | Magen Integrated Business Solutions (MIBS)',
  },

  description:
    'Magen Integrated Business Solutions (MIBS) provides commercial printing, DTF apparel transfers, educational syllabus publishing, signage, and environmental consultancy in Mount Darwin, Zimbabwe.',

  keywords: [
    'Magen Integrated Business Solutions',
    'MIBS',
    'MIBS Mount Darwin',
    'printing services Mount Darwin',
    'commercial printing Mount Darwin',
    'DTF t-shirt printing Zimbabwe',
    'school curriculum printing Zimbabwe',
    'environmental consultancy Mount Darwin',
    'digital media Mount Darwin',
    'branding services Mount Darwin',
    'business printing Mount Darwin',
    'flyer printing Mount Darwin',
    'Chiramba Complex Mount Darwin',
  ],

  authors: [
    {
      name: 'Magen Integrated Business Solutions (MIBS)',
    },
  ],

  creator: 'Magen Integrated Business Solutions (MIBS)',
  publisher: 'Magen Integrated Business Solutions (MIBS)',

  applicationName: 'Magen Integrated Business Solutions (MIBS)',

  category: 'Business Services',

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    url: siteUrl,
    siteName: 'Magen Integrated Services',
    title: 'Magen Integrated Services | Printing & Digital Media',
    description:
      'Professional printing, digital media, branding and design services in Mount Darwin, Zimbabwe. Find us at Chiramba Complex.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Magen Integrated Services | Mount Darwin',
    description:
      'Professional commercial printing, digital media, branding and design services in Mount Darwin, Zimbabwe.',
  },

  other: {
    'geo.region': 'ZW-MW',
    'geo.placename': 'Mount Darwin',
    'business:contact_data:locality': 'Mount Darwin',
    'business:contact_data:country_name': 'Zimbabwe',
    'business:contact_data:street_address': 'Chiramba Complex',
    'business:contact_data:email': 'magenmediahub@gmail.com',
    'business:contact_data:phone_number': '+263777923262',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',

  '@id': `${siteUrl}/#business`,

  name: 'Magen Integrated Services',

  alternateName: [
    'Magen Media Hub',
    'Magen Integrated Services Mount Darwin',
  ],

  description:
    'Magen Integrated Services provides commercial printing, digital media, graphic design, branding and print solutions in Mount Darwin, Zimbabwe.',

  url: siteUrl,

  email: 'magenmediahub@gmail.com',

  telephone: '+263777923262',

  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Chiramba Complex',
    addressLocality: 'Mount Darwin',
    addressRegion: 'Mashonaland Central',
    addressCountry: 'ZW',
  },

  areaServed: [
    {
      '@type': 'City',
      name: 'Mount Darwin',
    },
    {
      '@type': 'Country',
      name: 'Zimbabwe',
    },
  ],

  knowsAbout: [
    'Commercial Printing',
    'Digital Printing',
    'Graphic Design',
    'Digital Media',
    'Branding',
    'Marketing Materials',
    'Business Cards',
    'Flyers',
    'Posters',
    'Brochures',
    'Print Media',
  ],

  sameAs: [],

  potentialAction: {
    '@type': 'ContactAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://wa.me/263777923262',
      actionPlatform: [
        'https://schema.org/DesktopWebPlatform',
        'https://schema.org/MobileWebPlatform',
      ],
    },
    name: 'Contact Magen Integrated Services on WhatsApp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZW">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}

