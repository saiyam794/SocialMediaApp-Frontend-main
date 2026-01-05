
import type { Metadata } from 'next';
import '../styles/globals.css';
import { RootLayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: 'faceboooook',
  description: 'Facebook-like social feed with image support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}