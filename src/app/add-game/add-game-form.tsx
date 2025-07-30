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
  zipFile: z.instanceof(File).refine(file => file.size > 0, 'A .zip file is required.'),
  thumbnail: z.instanceof(File).optional(),
  markdownFile: z.instanceof(File).optional(),
});

export default function AddGameForm() {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
        },
    });

    const {formState: { isSubmitting }, setError} = form;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('zipFile', values.zipFile);
        if (values.thumbnail) {
            formData.append('thumbnail', values.thumbnail);
        }
        if (values.markdownFile) {
            formData.append('markdownFile', values.markdownFile);
        }
        
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
                description: "Could not add the game. Please try again.",
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
                                        <Textarea placeholder="A short, catchy description for the game card." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zipFile"
                            render={({ field: { onChange, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>Game ZIP File (Required)</FormLabel>
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
                                    <FormDescription>A cool image for the game card (PNG or JPG).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="markdownFile"
                            render={({ field: { onChange, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>Game Details File</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept=".md, .txt" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                                    </FormControl>
                                    <FormDescription>A Markdown (.md) or text file with instructions, story, etc.</FormDescription>
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
