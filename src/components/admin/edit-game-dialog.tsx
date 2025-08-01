'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Game } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateGame, reuploadFiles } from '@/app/admin/actions';

interface EditGameDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
  onGameUpdate: (updatedGame: Game) => void;
  backendUrl: string;
}

const formSchema = z.object({
  title: z.string().min(2, 'タイトルは2文字以上で入力してください。'),
  description: z.string().min(10, '説明は10文字以上で入力してください。'),
  markdownText: z.string().min(20, "Markdownは20文字以上で入力してください。"),
  zipFile: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
});

export default function EditGameDialog({ isOpen, setIsOpen, game, onGameUpdate, backendUrl }: EditGameDialogProps) {
  const { toast } = useToast();
  const [isReuploading, setIsReuploading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: game.title,
      description: game.description,
      markdownText: game.markdownText,
    },
  });
  
  useEffect(() => {
    if (game) {
      form.reset({
        title: game.title,
        description: game.description,
        markdownText: game.markdownText
      });
    }
  }, [game, form]);

  const handleReupload = async () => {
     if (!backendUrl) {
        toast({ title: "バックエンドURL未設定", description: "管理者ページでURLを設定してください。", variant: "destructive" });
        return;
    }
    const { zipFile, thumbnail } = form.getValues();
    if (!zipFile && !thumbnail) {
        toast({ title: "ファイル未選択", description: "再アップロードするファイルを選択してください。", variant: "destructive" });
        return;
    }

    const reuploadData = new FormData();
    reuploadData.append('gameId', game.id);
    reuploadData.append('backendUrl', backendUrl);
    if (zipFile) reuploadData.append('zipFile', zipFile);
    if (thumbnail) reuploadData.append('thumbnail', thumbnail);
    
    setIsReuploading(true);
    try {
        await reuploadFiles(reuploadData);
        toast({ title: "ファイル再アップロード成功！", description: "ファイルが正常に更新されました。" });
        // Optionally clear the file inputs
        form.setValue('zipFile', undefined);
        form.setValue('thumbnail', undefined);
    } catch (error) {
        toast({ title: "再アップロード失敗", description: error instanceof Error ? error.message : "サーバーエラー", variant: "destructive" });
    } finally {
        setIsReuploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        await updateGame(game.id, values.title, values.description, values.markdownText);
        const updatedGame: Game = {
            ...game,
            title: values.title,
            description: values.description,
            markdownText: values.markdownText,
        };
        onGameUpdate(updatedGame);
        toast({
            title: "ゲーム情報を更新しました！",
            description: `「${updatedGame.title}」の詳細が正常に更新されました。`,
        });
        setIsOpen(false);
    } catch (error) {
         toast({
            title: "更新失敗",
            description: "Firestoreのゲーム詳細更新に失敗しました。",
            variant: "destructive",
        });
    }
  };

  const hasFilesForReupload = !!form.watch('zipFile') || !!form.watch('thumbnail');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ゲーム編集: {game.title}</DialogTitle>
          <DialogDescription>
            ゲーム詳細を更新します。ファイルも置き換える場合は、下のセクションからアップロードしてください。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Text fields for update */}
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>ゲームタイトル</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>短い説明</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="markdownText" render={({ field }) => ( <FormItem> <FormLabel>ゲーム詳細 (Markdown)</FormLabel> <FormControl><Textarea rows={10} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>キャンセル</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : "テキスト情報を保存"}
              </Button>
            </DialogFooter>
          </form>

          {/* File re-upload section */}
          <div className="space-y-4 pt-6 border-t">
              <p className="text-sm font-medium">ファイルの再アップロード（任意）</p>
              <FormDescription>現在のゲームビルドやサムネイルを置き換える場合に利用します。</FormDescription>
              
              <FormField control={form.control} name="zipFile" render={({ field: { onChange, ...fieldProps }}) => ( <FormItem> <FormLabel>ゲームZIPファイル</FormLabel> <FormControl><Input type="file" accept=".zip" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="thumbnail" render={({ field: { onChange, ...fieldProps }}) => ( <FormItem> <FormLabel>サムネイル画像</FormLabel> <FormControl><Input type="file" accept="image/png, image/jpeg" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl> <FormMessage /> </FormItem> )} />
              
              <DialogFooter>
                  <Button onClick={handleReupload} disabled={!hasFilesForReupload || isReuploading}>
                      {isReuploading ? "アップロード中..." : "ファイルを再アップロード"}
                  </Button>
              </DialogFooter>
          </div>

        </Form>
      </DialogContent>
    </Dialog>
  );
}
