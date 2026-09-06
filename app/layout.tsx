import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintTrack - Sales & Inventory Tracker',
  description:
    'Real-time sales, receipt POS, quotation & cotation generator with Magen Integrated Solutions logo branding, offline sync, inventory depletion analytics, and exportable PDF summaries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
