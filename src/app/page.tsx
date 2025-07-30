'use client';

import { useState, useEffect } from 'react';
import type { Game } from '@/lib/types';
import GameCard from '@/components/game-card';
import GamePlayer from '@/components/game-player';
import { Gamepad2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCollection = collection(db, 'games');
        const q = query(gamesCollection, orderBy('createdAt', 'desc'));
        const gameSnapshot = await getDocs(q);
        const gamesList = gameSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Game));
        setGames(gamesList);
      } catch (error) {
        console.error("ゲームの読み込みに失敗しました:", error);
        // You could show a toast message here
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

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
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
              STEM Arcade
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              文化祭へようこそ！下のリストから気になるゲームを選んで遊んでみよう。
            </p>
          </div>
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[228px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} onPlay={handlePlay} />
              ))}
              {games.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 rounded-xl bg-card border border-dashed">
                  <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">まだゲームがありません</h3>
                  <p className="mt-2 text-muted-foreground">新しいゲームが追加されるのをお待ちください！</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
