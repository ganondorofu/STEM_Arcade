import type { Metadata } from 'next';
import { Noto_Sans_JP, M_PLUS_1p } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster"

const notoJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-jp',
});

const mplus1p = M_PLUS_1p({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-m-plus-1p',
});

export const metadata: Metadata = {
  title: 'STEM Arcade',
  description: 'A collection of WebGL games for the cultural festival.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', notoJp.variable, mplus1p.variable)}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
