
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Game } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateGame, reuploadFiles } from '@/app/admin/actions';

interface EditGameDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
  onGameUpdate: (updatedGame: Game) => void;
  backendUrl: string;
}

// Schema for text fields
const textFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です。'),
  description: z.string().optional(),
  markdownText: z.string().optional(),
});

// Schema for file fields
const fileFormSchema = z.object({
  zipFile: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
});

type TextFormValues = z.infer<typeof textFormSchema>;
type FileFormValues = z.infer<typeof fileFormSchema>;

export default function EditGameDialog({ isOpen, setIsOpen, game, onGameUpdate, backendUrl }: EditGameDialogProps) {
  const { toast } = useToast();
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [isSubmittingFiles, setIsSubmittingFiles] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Form instance for text fields
  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      title: game?.title ?? '',
      description: game?.description ?? '',
      markdownText: game?.markdownText ?? '',
    },
  });

  // Form instance for file fields
  const fileForm = useForm<FileFormValues>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      zipFile: undefined,
      thumbnail: undefined,
    },
  });

  // Effect to reset the form when the dialog is opened or the game changes.
  useEffect(() => {
    if (game && isOpen) {
      textForm.reset({
        title: game.title ?? '',
        description: game.description ?? '',
        markdownText: game.markdownText ?? '',
      });
    }
  }, [game, isOpen, textForm]);
  
  // Handler for text form submission
  const onTextSubmit: SubmitHandler<TextFormValues> = async (values) => {
    setIsSubmittingText(true);
    try {
      await updateGame(game.id, values.title, values.description || '', values.markdownText || '');
      const updatedGame: Game = {
        ...game,
        title: values.title,
        description: values.description || '',
        markdownText: values.markdownText || '',
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
        description: error instanceof Error ? error.message : "ゲーム情報の更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingText(false);
    }
  };

  // Handler for file form submission
  const onFileSubmit: SubmitHandler<FileFormValues> = async (values) => {
    const { zipFile, thumbnail } = values;
    if (!zipFile && !thumbnail) {
      toast({ title: "ファイル未選択", description: "再アップロードするファイルを選択してください。", variant: "destructive" });
      return;
    }

    const reuploadData = new FormData();
    reuploadData.append('id', game.id);
    if (zipFile) reuploadData.append('zip', zipFile);
    if (thumbnail) reuploadData.append('img', thumbnail);
    reuploadData.append('backendUrl', backendUrl);
    
    setIsSubmittingFiles(true);
    try {
      await reuploadFiles(reuploadData);
      toast({ title: "ファイル再アップロード成功！", description: "ファイルが正常に更新されました。" });
      
      // Reset form and clear file inputs manually
      fileForm.reset();
      if (zipInputRef.current) zipInputRef.current.value = '';
      if (thumbInputRef.current) thumbInputRef.current.value = '';
        
    } catch (error) {
      toast({ title: "再アップロード失敗", description: error instanceof Error ? error.message : "サーバーエラー", variant: "destructive" });
    } finally {
      setIsSubmittingFiles(false);
    }
  };
  
  const hasFilesForReupload = !!fileForm.watch('zipFile') || !!fileForm.watch('thumbnail');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ゲーム編集: {game.title}</DialogTitle>
          <DialogDescription>
            ゲーム詳細の更新とファイルの再アップロードを行えます。
          </DialogDescription>
        </DialogHeader>

        {/* Text Update Form */}
        <Form {...textForm}>
          <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-4 py-4 border-b">
            <FormField control={textForm.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>ゲームタイトル</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={textForm.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>短い説明</FormLabel> <FormControl><Textarea rows={2} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={textForm.control} name="markdownText" render={({ field }) => ( <FormItem> <FormLabel>ゲーム詳細 (Markdown)</FormLabel> <FormControl><Textarea rows={8} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>キャンセル</Button>
              <Button type="submit" disabled={isSubmittingText}>
                {isSubmittingText ? "保存中..." : "テキスト情報を保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* File Re-upload Form */}
        <Form {...fileForm}>
             <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-4 pt-6">
              <h4 className="text-sm font-medium">ファイルの再アップロード（任意）</h4>
              <FormDescription>現在のゲームビルドやサムネイルを新しいファイルに置き換えます。</FormDescription>
              
              <FormField
                control={fileForm.control}
                name="zipFile"
                render={({ field: { onChange, onBlur, name } }) => (
                  <FormItem>
                    <FormLabel>新しいゲームZIPファイル</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".zip"
                        ref={zipInputRef}
                        onChange={(e) => onChange(e.target.files?.[0])}
                        onBlur={onBlur}
                        name={name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={fileForm.control}
                name="thumbnail"
                render={({ field: { onChange, onBlur, name } }) => (
                  <FormItem>
                    <FormLabel>新しいサムネイル画像</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/png, image/jpeg"
                        ref={thumbInputRef}
                        onChange={(e) => onChange(e.target.files?.[0])}
                        onBlur={onBlur}
                        name={name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                  <Button type="submit" variant="secondary" disabled={!hasFilesForReupload || isSubmittingFiles}>
                      {isSubmittingFiles ? "アップロード中..." : "選択したファイルを再アップロード"}
                  </Button>
              </DialogFooter>
             </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
