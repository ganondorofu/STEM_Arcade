
import type { Game } from '@/lib/types';
import GameCard from '@/components/game-card';
import { Gamepad2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { getBackendUrl } from './admin/actions';

// This page will be dynamically rendered, but we can revalidate data
export const revalidate = 60; // Revalidate every 60 seconds

async function getGames(): Promise<Game[]> {
  try {
    const gamesCollection = collection(db, 'games');
    const q = query(gamesCollection, orderBy('createdAt', 'desc'));
    const gameSnapshot = await getDocs(q);
    const gamesList = gameSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp | undefined;
        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            markdownText: data.markdownText,
            createdAt: createdAt ? { seconds: createdAt.seconds, nanoseconds: createdAt.nanoseconds } : null,
            viewCount: data.viewCount || 0,
        } as Game;
    });
    return gamesList;
  } catch (error) {
      console.error("Failed to fetch games:", error);
      return [];
  }
}

export default async function Home() {
  // Fetch games and backendUrl in parallel
  const [games, backendUrl] = await Promise.all([
    getGames(),
    getBackendUrl()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
        <>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
              STEM Arcade
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              文化祭へようこそ！下のリストから気になるゲームを選んで遊んでみよう。
            </p>
          </div>
          
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} backendUrl={backendUrl} />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-20 rounded-xl bg-card border border-dashed">
                <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">まだゲームがありません</h3>
                <p className="mt-2 text-muted-foreground">新しいゲームが追加されるのをお待ちください！</p>
            </div>
          )}
        </>
    </div>
  );
}
