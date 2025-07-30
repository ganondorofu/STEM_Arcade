import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
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
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl font-bold">{game.title}</CardTitle>
        <CardDescription className="mt-2">{game.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={() => onPlay(game)} className="w-full" size="lg" variant="default">
          <PlayCircle className="mr-2 h-5 w-5" />
          Play
        </Button>
      </CardFooter>
    </Card>
  );
}
