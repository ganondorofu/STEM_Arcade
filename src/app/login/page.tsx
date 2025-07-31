
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { format } from 'date-fns';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 現在の時刻を "HHmm" 形式で取得 (例: 1430)
    const adminPassword = format(new Date(), 'HHmm');

    // Simulate a network request
    setTimeout(() => {
      if (password === adminPassword) {
        login();
      } else {
        toast({
          title: '認証失敗',
          description: 'パスワードが正しくありません。',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">管理者ログイン</CardTitle>
          <CardDescription>管理者ページにアクセスするには認証が必要です。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">現在の時刻 (HHMM)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="例: 0930"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2" />
              {isLoading ? '認証中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
