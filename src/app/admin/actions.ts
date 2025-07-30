'use server';

import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function updateGame(gameId: string, title: string, description: string, markdownText: string): Promise<void> {
  if (!gameId || !title || !description || !markdownText) {
    throw new Error("Missing required fields for update");
  }

  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    title,
    description,
    markdownText,
  });

  // Note: File re-uploads would be handled by a separate call to the Python server.
  // For example:
  // if (zipFile.size > 0) { await fetch(`https://python-server/upload/${gameId}`, { method: 'POST', body: zipFile }); }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteGame(gameId: string) {
  if (!gameId) {
    throw new Error('Game ID is required for deletion');
  }

  // Note: Deleting files from the Python server would be a separate API call.
  // For example: await fetch(`https://python-server/delete/${gameId}`, { method: 'DELETE' });

  const gameRef = doc(db, "games", gameId);
  await deleteDoc(gameRef);

  revalidatePath('/');
  revalidatePath('/admin');
}
