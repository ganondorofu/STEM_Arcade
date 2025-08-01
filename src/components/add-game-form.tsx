
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Game } from '@/lib/types';


const formSchema = z.object({
  title: z.string().min(1, {
    message: 'タイトルは必須です。',
  }),
  description: z.string().optional(),
  markdownText: z.string().optional(),
  zipFile: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
});

interface AddGameFormProps {
    onGameAdded: () => void;
    backendUrl: string;
}

export default function AddGameForm({ onGameAdded, backendUrl }: AddGameFormProps) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            markdownText: '',
            zipFile: undefined,
            thumbnail: undefined,
        },
    });

    const {formState: { isSubmitting }} = form;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!backendUrl) {
            toast({
                title: "バックエンドURL未設定",
                description: "ファイル操作の前に、バックエンドURLを設定してください。",
                variant: "destructive",
            });
            return;
        }

        const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const formData = new FormData();
        formData.append('id', gameId);
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('markdownText', values.markdownText || '');
        
        if (values.zipFile) {
            formData.append('zip', values.zipFile);
        }
        if (values.thumbnail) {
            formData.append('img', values.thumbnail);
        }
        
        try {
             // 1. Upload files to Python server (if any)
            const response = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Upload failed:", errorBody);
                throw new Error(`ファイルアップロードに失敗しました: ${response.statusText}. ${errorBody}`);
            }

            // 2. Add game data to Firestore from the client
            const newGameData: Omit<Game, 'id'> = {
                title: values.title,
                description: values.description || '',
                markdownText: values.markdownText || '',
                createdAt: serverTimestamp(),
            };

            await setDoc(doc(db, "games", gameId), newGameData);


            toast({
                title: "ゲームが追加されました！",
                description: `「${values.title}」がアーケードに登場しました。`,
            });
            form.reset(); // Reset form after successful submission
            onGameAdded(); // Callback to refresh the game list
        } catch (error) {
             toast({
                title: "アップロード失敗",
                description: error instanceof Error ? error.message : "ゲームの追加に失敗しました。もう一度お試しください。",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <PlusCircle className="mr-2" />
                    新しいゲームを追加
                </CardTitle>
                <CardDescription>
                    下のフォームを入力して、あなたのWebGLゲームをアーケードに追加しましょう。
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ゲームタイトル</FormLabel>
                                    <FormControl>
                                        <Input placeholder="例：宇宙脱出ゲーム" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>短い説明（任意）</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} placeholder="ゲームカードに表示される、短くキャッチーな説明文。" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="markdownText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ゲーム詳細 (Markdown対応, 任意)</FormLabel>
                                    <FormControl>
                                        <Textarea rows={8} placeholder="操作方法、ストーリー、クレジットなどをMarkdownで記述してください。" {...field} />
                                    </FormControl>
                                     <FormDescription>
                                        # 見出し, ## 小見出し, --- 区切り線などが使えます。
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zipFile"
                            render={({ field: { onChange, value, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>ゲームのZIPファイル（任意）</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept=".zip" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormDescription>UnityからWebGLビルドしたものをzip圧縮してください。</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="thumbnail"
                            render={({ field: { onChange, value, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>サムネイル画像（任意）</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/png, image/jpeg" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormDescription>ゲームカードに表示する画像 (PNG or JPG)。`img.png`として保存されます。</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            <UploadCloud className="mr-2 h-5 w-5" />
                            {isSubmitting ? 'アップロード中...' : 'アーケードにゲームを追加'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
