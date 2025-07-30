'use client';

import Link from 'next/link';
import { Gamepad2, PlusCircle, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/add-game', label: 'Add Game', icon: PlusCircle },
    { href: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg sm:inline-block">STEM Arcade</span>
        </Link>
        <div className="flex-1" />
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                pathname === link.href && 'text-primary'
              )}
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline-block">{link.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
