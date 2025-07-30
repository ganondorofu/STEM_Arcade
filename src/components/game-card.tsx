import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={game.thumbnailPath}
            alt={game.title}
            fill
            className="object-cover"
            data-ai-hint="gameplay screenshot"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold">{game.title}</CardTitle>
        <CardDescription className="mt-2 text-sm">{game.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onPlay(game)} className="w-full transition-transform hover:scale-105 active:scale-95">
          Play Game
        </Button>
      </CardFooter>
    </Card>
  );
}
