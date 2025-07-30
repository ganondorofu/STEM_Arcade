import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  const thumbnailPath = `/games/${game.id}/img.png`;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={thumbnailPath}
            alt={game.title}
            fill
            className="object-cover"
            data-ai-hint="gameplay screenshot"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              // If the image fails to load, use a placeholder
              e.currentTarget.src = 'https://placehold.co/600x400/f8bbd0/333333';
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold">{game.title}</CardTitle>
        <CardDescription className="mt-2 text-sm line-clamp-2">{game.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onPlay(game)} className="w-full transition-transform hover:scale-105 active:scale-95">
          Play Game
        </Button>
      </CardFooter>
    </Card>
  );
}
