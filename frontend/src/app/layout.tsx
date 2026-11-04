import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Wyxan Browser',
  description: 'Full-stack database-backed web browser system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 antialiased overflow-hidden h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
