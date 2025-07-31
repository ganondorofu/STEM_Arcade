
'use client';

import Link from 'next/link';
import { Gamepad2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg sm:inline-block">STEM Arcade</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
               <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  管理者パネルへ
                </Link>
              </Button>
              <Button variant="secondary" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
