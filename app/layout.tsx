import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintTrack - Sales & Inventory Tracker',
  description:
    'Commercial print & media services showcase, client cotation request builder, and teller POS terminal with Magen Integrated Solutions branding, offline sync, and real-time inventory management.',
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
