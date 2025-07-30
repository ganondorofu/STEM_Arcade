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
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateGame } from '@/app/admin/actions';

interface EditGameDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
  onGameUpdate: (updatedGame: Game) => void;
}

const formSchema = z.object({
  title: z.string().min(2, 'タイトルは2文字以上で入力してください。'),
  description: z.string().min(10, '説明は10文字以上で入力してください。'),
  markdownText: z.string().min(20, "Markdownは20文字以上で入力してください。"),
  // File inputs are now for re-upload and are optional
  zipFile: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
});

export default function EditGameDialog({ isOpen, setIsOpen, game, onGameUpdate }: EditGameDialogProps) {
  const { toast } = useToast();
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Note: In a real app, if files are selected, you'd send them
    // to your Python server here.
    const reuploadData = new FormData();
    if (values.zipFile) reuploadData.append('zipFile', values.zipFile);
    if (values.thumbnail) reuploadData.append('thumbnail', values.thumbnail);

    if (reuploadData.has('zipFile') || reuploadData.has('thumbnail')) {
        console.log("ファイルを再アップロードします:", game.id);
        // await fetch(`/api/reupload/${game.id}`, { method: 'POST', body: reuploadData });
        toast({ title: "ファイル再アップロード（シミュレーション）", description: "実際のアプリでは、ここでファイルがPythonサーバーに再アップロードされます。"})
    }

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ゲーム編集: {game.title}</DialogTitle>
          <DialogDescription>
            ゲーム詳細を更新します。既存ファイルを維持する場合は、ファイル入力欄は空のままにしてください。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ゲームタイトル</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>短い説明</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="markdownText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ゲーム詳細 (Markdown)</FormLabel>
                  <FormControl><Textarea rows={10} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <p className="text-sm font-medium pt-4">ファイルの再アップロード（任意）</p>
            <FormDescription>これらのファイルはPythonサーバーに送信され、既存のファイルを上書きします。</FormDescription>
            
             <FormField
                control={form.control}
                name="zipFile"
                render={({ field: { onChange, ...fieldProps }}) => (
                    <FormItem>
                        <FormLabel>ゲームZIPファイル</FormLabel>
                        <FormControl><Input type="file" accept=".zip" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl>
                        <FormDescription>現在のゲームビルドを置き換える新しいZIPをアップロードします。</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="thumbnail"
                render={({ field: { onChange, ...fieldProps }}) => (
                    <FormItem>
                        <FormLabel>サムネイル画像 (img.png)</FormLabel>
                        <FormControl><Input type="file" accept="image/png, image/jpeg" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl>
                         <FormDescription>現在のサムネイルを置き換える新しい画像をアップロードします。</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>キャンセル</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : "変更を保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
