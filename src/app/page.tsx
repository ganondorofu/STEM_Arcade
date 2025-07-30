'use client';

import { useState } from 'react';
import type { Game } from '@/lib/types';
import { games as initialGames } from '@/lib/data';
import GameCard from '@/components/game-card';
import GamePlayer from '@/components/game-player';
import { Gamepad2 } from 'lucide-react';

export default function Home() {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handlePlay = (game: Game) => {
    setSelectedGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClosePlayer = () => {
    setSelectedGame(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedGame ? (
        <GamePlayer game={selectedGame} onClose={handleClosePlayer} />
      ) : (
        <>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              BunkaSai Arcade
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome! Choose a game below and start playing. Created by students for our cultural festival.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onPlay={handlePlay} />
            ))}
            {games.length === 0 && (
              <div className="col-span-full text-center py-20 rounded-xl bg-card border border-dashed">
                <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Games Yet</h3>
                <p className="mt-2 text-muted-foreground">Check back later or add a new game!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
