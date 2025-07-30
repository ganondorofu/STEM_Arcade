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
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  markdownText: z.string().min(20, {
    message: 'Markdown text must be at least 20 characters.'
  }),
  zipFile: z.instanceof(File).refine(file => file.size > 0, 'A .zip file is required.'),
  thumbnail: z.instanceof(File).refine(file => file.size > 0, 'A thumbnail image is required.'),
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
                title: "Game Added!",
                description: `${values.title} is now in the arcade.`,
            });
            router.push('/');
        } catch (error) {
             toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Could not add the game. Please try again.",
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
                                    <FormLabel>Game Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Space Escape" {...field} />
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
                                    <FormLabel>Short Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} placeholder="A short, catchy description for the game card." {...field} />
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
                                    <FormLabel>Game Details (Markdown)</FormLabel>
                                    <FormControl>
                                        <Textarea rows={8} placeholder="Use Markdown for instructions, story, credits, etc." {...field} />
                                    </FormControl>
                                     <FormDescription>
                                        You can use Markdown syntax like # Title, ## Subtitle, and --- for dividers.
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
                                    <FormLabel>Game ZIP File</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept=".zip" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormDescription>The exported WebGL build from Unity, zipped.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="thumbnail"
                            render={({ field: { onChange, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>Thumbnail Image</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/png, image/jpeg" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormDescription>A cool image for the game card (PNG or JPG). This will be saved as `img.png`</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            <UploadCloud className="mr-2 h-5 w-5" />
                            {isSubmitting ? 'Uploading...' : 'Add Game to Arcade'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
