
'use client';

import type { Game } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// Updated Feedback type to use Date object
interface Feedback {
  id: string;
  gameId: string;
  comment: string;
  timestamp: Date;
}

interface ViewFeedbackDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
  feedbacks: Feedback[];
}

export default function ViewFeedbackDialog({ isOpen, setIsOpen, game, feedbacks }: ViewFeedbackDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>「{game.title}」へのフィードバック</DialogTitle>
          <DialogDescription>
            閲覧数: {game.viewCount || 0} | コメント数: {feedbacks.length}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border">
          <div className="p-4 space-y-4">
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <Card key={feedback.id} className="bg-background">
                  <CardContent className="p-4">
                    <p className="text-sm">{feedback.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(feedback.timestamp, { addSuffix: true, locale: ja })}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground">このゲームへのフィードバックはまだありません。</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
