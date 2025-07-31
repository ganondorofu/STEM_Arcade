'use server';

import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import { addDoc, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addGame(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const markdownText = formData.get('markdownText') as string;
  const backendUrl = formData.get('backendUrl') as string; // Get backendUrl from formData

  if (!title) {
    throw new Error('Missing required text fields');
  }
  
  if (!backendUrl) {
    throw new Error('Backend URL is not configured.');
  }

  // Generate a unique ID on the client and pass it along
  const gameId = `game_${Math.random().toString(36).substring(2, 11)}`;
  formData.append('id', gameId);

  // 1. Upload files to Python server
  const response = await fetch(`${backendUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Upload failed:", errorBody);
    throw new Error(`Upload failed: ${response.statusText}. ${errorBody}`);
  }

  // 2. Add game data to Firestore
  const newGame: Omit<Game, 'id'> = {
    title,
    description,
    markdownText,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "games", gameId), newGame);
  
  // 3. Revalidate paths to show the new game immediately
  revalidatePath('/');
  revalidatePath('/admin');
}
