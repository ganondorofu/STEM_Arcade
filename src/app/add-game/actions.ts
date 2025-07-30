'use server';

import { games } from "@/lib/data";
import { Game } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function addGame(formData: FormData) {
  // In a real application, you would send this formData to your Python server.
  // The server would then handle file extraction, saving, and creating the Firestore document.
  
  // For demonstration purposes, we will simulate this process.
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const zipFile = formData.get('zipFile') as File;
  const thumbnailFile = formData.get('thumbnail') as File | null;
  const markdownFile = formData.get('markdownFile') as File | null;

  if (!title || !description || !zipFile) {
    throw new Error('Missing required fields');
  }

  // 1. Generate a unique ID
  const gameId = `game_${Math.random().toString(36).substring(2, 10)}`;
  
  // 2. Simulate file upload and get paths
  const thumbnailPath = thumbnailFile 
    ? `/assets/thumbnails/${gameId}.${thumbnailFile.name.split('.').pop()}` 
    : `https://placehold.co/600x400/f8bbd0/333333`;
  
  const markdownPath = markdownFile 
    ? `/assets/markdown/${gameId}.md` 
    : `/markdown/${gameId}.md`;
    
  const gameUrl = `/games/${gameId}/index.html`;

  console.log("--- New Game Submission ---");
  console.log("Game ID:", gameId);
  console.log("Title:", title);
  console.log("ZIP File:", zipFile.name, `${(zipFile.size / 1024 / 1024).toFixed(2)} MB`);
  if (thumbnailFile) console.log("Thumbnail:", thumbnailFile.name);
  if (markdownFile) console.log("Markdown:", markdownFile.name);
  console.log("--------------------------");

  // 3. Create a new game object (simulating saving to Firestore)
  const newGame: Game = {
    id: gameId,
    title,
    description,
    thumbnailPath,
    markdownPath,
    gameUrl,
    createdAt: new Date(),
  };

  // 4. Add to our mock database
  games.unshift(newGame);

  // 5. Revalidate the cache for the home page to show the new game
  revalidatePath('/');
  revalidatePath('/admin');
}
