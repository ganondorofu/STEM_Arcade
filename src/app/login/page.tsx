
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    // パスワードは現在の時刻 (HHMM)
    const now = new Date();
    const correctPassword = 
      now.getHours().toString().padStart(2, '0') + 
      now.getMinutes().toString().padStart(2, '0');

    if (login(password)) {
       toast({
        title: 'ログイン成功',
        description: '管理者パネルへようこそ。',
      });
      router.push('/admin');
    } else {
      toast({
        title: 'ログイン失敗',
        description: 'パスワードが正しくありません。',
        variant: 'destructive',
      });
      setPassword('');
    }
  };

  return (
    <div className="container flex h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4 text-primary-foreground">
                <KeyRound size={32} />
            </div>
          <CardTitle>管理者ログイン</CardTitle>
          <CardDescription>管理者パネルにアクセスするには、パスワードを入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="パスワードを入力..."
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              ログイン
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
