
import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  // Add a timestamp to the image URL to bust the cache when the image is updated.
  const thumbnailPath = `/games/${game.id}/img.png?t=${Date.now()}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 bg-secondary border-secondary-foreground/10">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={thumbnailPath}
            alt={game.title}
            fill
            className="object-cover"
            data-ai-hint="gameplay screenshot"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized // Use unoptimized as the image is served from a different origin after rewrite.
            onError={(e) => {
              // Replace with a local, non-optimized placeholder to prevent loops
              e.currentTarget.src = '/placeholder.png';
              e.currentTarget.srcset = '/placeholder.png';
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold text-primary">{game.title}</CardTitle>
        <CardDescription className="mt-2 text-sm line-clamp-2 text-muted-foreground">{game.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onPlay(game)} className="w-full transition-transform hover:scale-105 active:scale-95">
            <Play className="mr-2 h-4 w-4"/>
            プレイする
        </Button>
      </CardFooter>
    </Card>
  );
}
