
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Server } from 'lucide-react';

interface BackendUrlConfigProps {
    onUrlChange: (url: string) => void;
}

export default function BackendUrlConfig({ onUrlChange }: BackendUrlConfigProps) {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedUrl = localStorage.getItem('backendUrl');
    if (savedUrl) {
      setUrl(savedUrl);
      onUrlChange(savedUrl);
    }
  }, [onUrlChange]);

  const handleSave = () => {
    try {
        // Basic URL validation
        new URL(url);
        localStorage.setItem('backendUrl', url);
        onUrlChange(url);
        toast({
            title: '保存しました',
            description: 'バックエンドURLが正常に保存されました。',
        });
    } catch (error) {
        toast({
            title: '無効なURLです',
            description: '有効なURLを入力してください (例: http://localhost:8000)',
            variant: 'destructive',
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Server className="mr-2" />
            バックエンド設定
        </CardTitle>
        <CardDescription>
          PythonサーバーのURLを設定してください。ファイル操作 (アップロード、削除) はこのURLに送信されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <Label htmlFor="backend-url">PythonサーバーURL</Label>
            <div className="flex gap-2 mt-2">
                <Input
                id="backend-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:5000"
                />
                <Button onClick={handleSave}>保存</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
