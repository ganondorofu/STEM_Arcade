'use server';

import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addGame(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const markdownText = formData.get('markdownText') as string;
  const backendUrl = formData.get('backendUrl') as string;

  if (!title || !backendUrl) {
    throw new Error('タイトルまたはバックエンドURLがありません。');
  }

  // Generate a unique ID and append it to the form data for the backend
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  formData.append('id', gameId);

  // 1. Upload files to Python server (if any)
  const response = await fetch(`${backendUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Upload failed:", errorBody);
    throw new Error(`ファイルアップロードに失敗しました: ${response.statusText}. ${errorBody}`);
  }

  // 2. Add game data to Firestore from the frontend action
  const newGameData: Omit<Game, 'id'> = {
    title,
    description: description || '',
    markdownText: markdownText || '',
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "games", gameId), newGameData);
  
  // 3. Revalidate paths to show the new game immediately
  revalidatePath('/');
  revalidatePath('/admin');
}
