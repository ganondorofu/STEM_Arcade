
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, MessageSquareHeart, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


interface FeedbackFormProps {
  gameId: string;
  backendUrl: string;
}

export default function FeedbackForm({ gameId, backendUrl }: FeedbackFormProps) {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();


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
        // 1. Send feedback to Python server to be saved in a text file
        const formData = new FormData();
        formData.append('id', gameId);
        formData.append('text', comment);

        const response = await fetch(`${backendUrl}/feedback`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Feedback submission to backend failed:", errorBody);
            throw new Error(`フィードバックのバックエンドへの送信に失敗しました: ${response.statusText}. ${errorBody}`);
        }

        // 2. Save feedback to Firestore
        await addDoc(collection(db, 'feedbacks'), {
            gameId,
            comment,
            createdAt: serverTimestamp(),
        });

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
            disabled={isSubmitting || !backendUrl}
          />
          <Button type="submit" className="w-full" variant="secondary" disabled={isSubmitting || !backendUrl}>
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
