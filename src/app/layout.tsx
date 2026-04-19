import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orbit Racer | High Speed Arcade',
  description: 'A professional car racing game built with Next.js and Canvas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}