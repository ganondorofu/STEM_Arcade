'use server';

import { games } from "@/lib/data";
import { Game } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updateGame(formData: FormData): Promise<Game> {
  const gameId = formData.get('gameId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  const gameIndex = games.findIndex(g => g.id === gameId);

  if (gameIndex === -1) {
    throw new Error('Game not found');
  }

  const existingGame = games[gameIndex];

  // Simulate file re-uploads by checking if new files were provided
  const zipFile = formData.get('zipFile') as File | null;
  const thumbnailFile = formData.get('thumbnail') as File | null;
  const markdownFile = formData.get('markdownFile') as File | null;
  
  if (zipFile && zipFile.size > 0) console.log(`Re-uploading ZIP for ${gameId}: ${zipFile.name}`);
  if (thumbnailFile && thumbnailFile.size > 0) console.log(`Re-uploading thumbnail for ${gameId}: ${thumbnailFile.name}`);
  if (markdownFile && markdownFile.size > 0) console.log(`Re-uploading markdown for ${gameId}: ${markdownFile.name}`);

  const updatedGame: Game = {
    ...existingGame,
    title,
    description,
  };

  games[gameIndex] = updatedGame;

  revalidatePath('/');
  revalidatePath('/admin');
  
  return updatedGame;
}

export async function deleteGame(gameId: string) {
  const gameIndex = games.findIndex(g => g.id === gameId);

  if (gameIndex === -1) {
    throw new Error('Game not found');
  }

  games.splice(gameIndex, 1);

  revalidatePath('/');
  revalidatePath('/admin');
}
