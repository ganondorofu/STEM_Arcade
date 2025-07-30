'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, MessageSquareHeart, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { submitFeedback } from '@/app/actions';

interface FeedbackFormProps {
  gameId: string;
}

export default function FeedbackForm({ gameId }: FeedbackFormProps) {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const { toast } = useToast();

  useState(() => {
    const url = localStorage.getItem('backendUrl');
    if (url) {
        setBackendUrl(url);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === '') {
        toast({
            title: "おっと！",
            description: "コメントを入力してから送信してください。",
            variant: "destructive",
        })
        return;
    };
    if (!backendUrl) {
        toast({
            title: "バックエンドURL未設定",
            description: "フィードバックを送信できません。管理者に連絡してください。",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        await submitFeedback({ gameId, comment, backendUrl });
        setSubmitted(true);
        toast({
            title: "ありがとうございます！",
            description: "フィードバックが送信されました。",
        });
    } catch (error) {
        toast({
            title: "送信失敗",
            description: error instanceof Error ? error.message : "フィードバックの送信に失敗しました。",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? '送信中...' : 'フィードバックを送信'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
