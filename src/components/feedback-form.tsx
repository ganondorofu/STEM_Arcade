'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, MessageSquareHeart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface FeedbackFormProps {
  gameId: string;
}

export default function FeedbackForm({ gameId }: FeedbackFormProps) {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === '') {
        toast({
            title: "Oops!",
            description: "Please enter a comment before submitting.",
            variant: "destructive",
        })
        return;
    };
    
    console.log('Feedback submitted for game', gameId, ':', comment);
    // In a real app, this would call a server action to save to Firestore.
    // e.g., await submitFeedback({ gameId, comment });
    
    setSubmitted(true);
    toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
    });
  };

  if (submitted) {
    return (
      <Card className="flex flex-col items-center justify-center text-center bg-accent/30 border-accent">
        <CardHeader>
          <MessageSquareHeart className="mx-auto h-12 w-12 text-primary" />
        </CardHeader>
        <CardContent>
          <CardTitle>Thanks for your feedback!</CardTitle>
          <CardDescription className="mt-2">We appreciate you taking the time to help us improve.</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Anonymous Feedback</CardTitle>
        <CardDescription>Your comments are valuable to the creators!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="This game was so much fun! Maybe you could add..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Button type="submit" className="w-full" variant="secondary">
            <Send className="mr-2 h-4 w-4" />
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
