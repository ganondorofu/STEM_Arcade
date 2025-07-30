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
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  zipFile: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
  markdownFile: z.instanceof(File).optional(),
});

export default function EditGameDialog({ isOpen, setIsOpen, game, onGameUpdate }: EditGameDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: game.title,
      description: game.description,
    },
  });
  
  useEffect(() => {
    if (game) {
      form.reset({
        title: game.title,
        description: game.description,
      });
    }
  }, [game, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('gameId', game.id);
    formData.append('title', values.title);
    formData.append('description', values.description);
    if (values.zipFile) formData.append('zipFile', values.zipFile);
    if (values.thumbnail) formData.append('thumbnail', values.thumbnail);
    if (values.markdownFile) formData.append('markdownFile', values.markdownFile);

    try {
        const updatedGame = await updateGame(formData);
        onGameUpdate(updatedGame);
        toast({
            title: "Game Updated!",
            description: `"${updatedGame.title}" has been successfully updated.`,
        });
        setIsOpen(false);
    } catch (error) {
         toast({
            title: "Update Failed",
            description: "Could not update the game. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Game: {game.title}</DialogTitle>
          <DialogDescription>
            Update the game details below. To keep existing files, just leave the file inputs empty.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Title</FormLabel>
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
                  <FormLabel>Short Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm font-medium pt-4">Re-upload Files (Optional)</p>
             <FormField
                control={form.control}
                name="zipFile"
                render={({ field: { onChange, ...fieldProps }}) => (
                    <FormItem>
                        <FormLabel>Game ZIP File</FormLabel>
                        <FormControl><Input type="file" accept=".zip" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl>
                        <FormDescription>Upload a new ZIP to replace the current game build.</FormDescription>
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
                        <FormControl><Input type="file" accept="image/png, image/jpeg" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl>
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
                        <FormControl><Input type="file" accept=".md, .txt" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
