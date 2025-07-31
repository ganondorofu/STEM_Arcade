
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
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';


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
      fileForm.reset({
        zipFile: undefined,
        thumbnail: undefined,
      })
    }
  }, [game, isOpen, textForm, fileForm]);
  
  // Handler for text form submission
  const onTextSubmit: SubmitHandler<TextFormValues> = async (values) => {
    setIsSubmittingText(true);
    try {
      const gameRef = doc(db, "games", game.id);
      await updateDoc(gameRef, {
        title: values.title,
        description: values.description || '',
        markdownText: values.markdownText || '',
      });

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
      // Do not close dialog on text update
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
    if (!backendUrl) {
      toast({ title: "バックエンドURL未設定", description: "操作の前に、管理者ページでバックエンドURLを設定してください。", variant: "destructive" });
      return;
    }

    const reuploadData = new FormData();
    reuploadData.append('id', game.id);
    if (zipFile) reuploadData.append('zip', zipFile);
    if (thumbnail) reuploadData.append('img', thumbnail);
    
    setIsSubmittingFiles(true);
    try {
      const response = await fetch(`${backendUrl}/reupload`, {
          method: 'POST',
          body: reuploadData,
      });

      if (!response.ok) {
          const errorBody = await response.text();
          console.error("再アップロードに失敗しました:", errorBody);
          throw new Error(`再アップロードに失敗しました: ${response.statusText}. ${errorBody}`);
      }
      
      toast({ title: "ファイル再アップロード成功！", description: "ファイルが正常に更新されました。" });
      
      // Reset form and clear file inputs manually
      fileForm.reset();
      if (zipInputRef.current) zipInputRef.current.value = '';
      if (thumbInputRef.current) thumbInputRef.current.value = '';

      // Trigger a re-render of the game card to show the new thumbnail
      // A slight delay might be needed for the server to process the image
      setTimeout(() => {
        onGameUpdate({ ...game, id: game.id + '_updated' }); // Force re-render by changing a prop
      }, 500);


    } catch (error) {
      toast({ title: "再アップロード失敗", description: error instanceof Error ? error.message : "サーバーエラー", variant: "destructive" });
    } finally {
      setIsSubmittingFiles(false);
    }
  };
  
  const hasFilesForReupload = !!fileForm.watch('zipFile') || !!fileForm.watch('thumbnail');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>ゲーム編集: {game.title}</DialogTitle>
          <DialogDescription>
            ゲーム詳細の更新とファイルの再アップロードを行えます。
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-4 -mr-4 space-y-8">
            {/* Text Update Form */}
            <Form {...textForm}>
            <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-4 py-4 border-b">
                <FormField control={textForm.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>ゲームタイトル</FormLabel> <FormControl><Input {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={textForm.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>短い説明</FormLabel> <FormControl><Textarea rows={2} {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={textForm.control} name="markdownText" render={({ field }) => ( <FormItem> <FormLabel>ゲーム詳細 (Markdown)</FormLabel> <FormControl><Textarea rows={8} {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                
                <div className='flex justify-end'>
                    <Button type="submit" disabled={isSubmittingText}>
                        {isSubmittingText ? "保存中..." : "テキスト情報を保存"}
                    </Button>
                </div>
            </form>
            </Form>

            {/* File Re-upload Form */}
            <Form {...fileForm}>
                <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-4">
                <h4 className="text-sm font-medium">ファイルの再アップロード（任意）</h4>
                <FormDescription>現在のゲームビルドやサムネイルを新しいファイルに置き換えます。</FormDescription>
                
                <FormField
                    control={fileForm.control}
                    name="zipFile"
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                        <FormLabel>新しいゲームZIPファイル</FormLabel>
                        <FormControl>
                        <Input
                            type="file"
                            accept=".zip"
                            ref={(e) => {
                                ref(e)
                                if(zipInputRef) (zipInputRef.current as any) = e
                            }}
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
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                        <FormLabel>新しいサムネイル画像</FormLabel>
                        <FormControl>
                        <Input
                            type="file"
                            accept="image/png, image/jpeg"
                            ref={(e) => {
                                ref(e)
                                if(thumbInputRef) (thumbInputRef.current as any) = e
                            }}
                            onChange={(e) => onChange(e.target.files?.[0])}
                            onBlur={onBlur}
                            name={name}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <div className='flex justify-end'>
                    <Button type="submit" variant="secondary" disabled={!hasFilesForReupload || isSubmittingFiles}>
                        {isSubmittingFiles ? "アップロード中..." : "選択したファイルを再アップロード"}
                    </Button>
                </div>
                </form>
            </Form>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
