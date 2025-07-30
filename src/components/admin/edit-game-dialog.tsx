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
  markdownText: z.string().min(20, "Markdown must be at least 20 characters."),
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
        console.log("Re-uploading files for game:", game.id);
        // await fetch(`/api/reupload/${game.id}`, { method: 'POST', body: reuploadData });
        toast({ title: "File Re-upload Simulated", description: "In a real app, files would be re-uploaded to the Python server."})
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
            title: "Game Updated!",
            description: `"${updatedGame.title}" has been successfully updated.`,
        });
        setIsOpen(false);
    } catch (error) {
         toast({
            title: "Update Failed",
            description: "Could not update game details in Firestore.",
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
            <FormField
              control={form.control}
              name="markdownText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Details (Markdown)</FormLabel>
                  <FormControl><Textarea rows={10} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <p className="text-sm font-medium pt-4">Re-upload Files (Optional)</p>
            <FormDescription>These files will be sent to the Python server to overwrite existing ones.</FormDescription>
            
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
                        <FormLabel>Thumbnail Image (img.png)</FormLabel>
                        <FormControl><Input type="file" accept="image/png, image/jpeg" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} /></FormControl>
                         <FormDescription>Upload a new image to replace the current thumbnail.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter className="mt-4">
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
