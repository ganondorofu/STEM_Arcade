
'use client';

import { useState, useEffect } from 'react';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

interface GameCardProps {
  game: Game;
  backendUrl: string;
}

export default function GameCard({ game, backendUrl }: GameCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (backendUrl) {
      // Add a timestamp to the image URL to bust the cache when the image is updated.
      // This is useful when a thumbnail is re-uploaded.
      const src = `${backendUrl}/games/${game.id}/img.png?t=${new Date().getTime()}`;
      setImageSrc(src);
      setImageError(false); // Reset error state when game or backendUrl changes
    }
  }, [backendUrl, game.id]);


  const handleImageError = () => {
    setImageError(true);
  };

  const isLoading = !backendUrl || !imageSrc;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 bg-secondary border-secondary-foreground/10">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img
              src={imageError ? 'https://placehold.co/600x400/0f172a/94a3b8' : imageSrc}
              alt={game.title}
              className="object-cover w-full h-full"
              data-ai-hint="gameplay screenshot"
              onError={handleImageError}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold text-primary">{game.title}</CardTitle>
        <CardDescription className="mt-2 text-sm line-clamp-2 text-muted-foreground">{game.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full transition-transform hover:scale-105 active:scale-95">
            <Link href={`/games/${game.id}`}>
              <Play className="mr-2 h-4 w-4"/>
              プレイする
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
