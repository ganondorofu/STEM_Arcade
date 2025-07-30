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
            title: "おっと！",
            description: "コメントを入力してから送信してください。",
            variant: "destructive",
        })
        return;
    };
    
    console.log('Feedback submitted for game', gameId, ':', comment);
    // In a real app, this would call a server action to save to Firestore.
    // e.g., await submitFeedback({ gameId, comment });
    
    setSubmitted(true);
    toast({
        title: "ありがとうございます！",
        description: "フィードバックが送信されました。",
    });
  };

  if (submitted) {
    return (
      <Card className="flex flex-col items-center justify-center text-center bg-accent/30 border-accent">
        <CardHeader>
          <MessageSquareHeart className="mx-auto h-12 w-12 text-primary" />
        </CardHeader>
        <CardContent>
          <CardTitle>フィードバックを送信しました！</CardTitle>
          <CardDescription className="mt-2">ご協力いただきありがとうございました。</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>匿名でフィードバックを送る</CardTitle>
        <CardDescription>あなたの感想が、制作者の力になります！</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="このゲーム、すごく楽しかったです！もしできれば..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Button type="submit" className="w-full" variant="secondary">
            <Send className="mr-2 h-4 w-4" />
            フィードバックを送信
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
