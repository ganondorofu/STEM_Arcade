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
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { addGame } from './actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'タイトルは2文字以上で入力してください。',
  }),
  description: z.string().min(10, {
    message: '説明は10文字以上で入力してください。',
  }),
  markdownText: z.string().min(20, {
    message: 'Markdownテキストは20文字以上で入力してください。'
  }),
  zipFile: z.instanceof(File).refine(file => file.size > 0, '.zipファイルは必須です。'),
  thumbnail: z.instanceof(File).refine(file => file.size > 0, 'サムネイル画像は必須です。'),
});

export default function AddGameForm() {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            markdownText: ''
        },
    });

    const {formState: { isSubmitting }, setError} = form;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('markdownText', values.markdownText);
        formData.append('zipFile', values.zipFile);
        formData.append('thumbnail', values.thumbnail);
        
        try {
            await addGame(formData);
            toast({
                title: "ゲームが追加されました！",
                description: `「${values.title}」がアーケードに登場しました。`,
            });
            router.push('/');
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
                                    <FormLabel>短い説明</FormLabel>
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
                                    <FormLabel>ゲーム詳細 (Markdown対応)</FormLabel>
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
                            render={({ field: { onChange, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>ゲームのZIPファイル</FormLabel>
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
                            render={({ field: { onChange, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>サムネイル画像</FormLabel>
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
