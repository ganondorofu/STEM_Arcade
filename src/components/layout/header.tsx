
'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg sm:inline-block">STEM Arcade</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          {/* Admin login button removed as per request */}
        </div>
      </div>
    </header>
  );
}
