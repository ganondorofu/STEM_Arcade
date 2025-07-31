
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Server, Loader2 } from 'lucide-react';
import { getBackendUrl, saveBackendUrl } from '@/app/admin/actions';

export default function BackendUrlConfig() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUrl = async () => {
      setIsLoading(true);
      const savedUrl = await getBackendUrl();
      setUrl(savedUrl);
      setIsLoading(false);
    };
    fetchUrl();
  }, []);

  const handleSave = () => {
    startSavingTransition(async () => {
      const result = await saveBackendUrl(url);
      if (result.success) {
        toast({
            title: '保存しました',
            description: 'バックエンドURLが正常に保存されました。ページをリロードすると、変更が全体に反映されます。',
        });
      } else {
        toast({
            title: '保存失敗',
            description: result.error || '不明なエラーが発生しました。',
            variant: 'destructive',
        });
      }
    });
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
                {isLoading ? (
                    <div className="flex items-center justify-center w-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                    <Input
                        id="backend-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="http://localhost:5000"
                        disabled={isSaving}
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? '保存中...' : '保存'}
                    </Button>
                    </>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
