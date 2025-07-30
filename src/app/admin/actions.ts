'use server';

import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function updateGame(gameId: string, title: string, description: string, markdownText: string): Promise<void> {
  if (!gameId || !title) {
    throw new Error("Missing required fields for update");
  }

  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    title,
    description,
    markdownText,
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/games/${gameId}`);
}

export async function deleteGame(gameId: string, backendUrl: string) {
  if (!gameId) {
    throw new Error('Game ID is required for deletion');
  }
   if (!backendUrl) {
    throw new Error('Backend URL is not configured.');
  }

  const formData = new FormData();
  formData.append('id', gameId);

  // Also delete files from the Python server
  const response = await fetch(`${backendUrl}/delete`, { 
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
     const errorBody = await response.text();
     console.error("File deletion failed:", errorBody);
     throw new Error(`File deletion on backend failed: ${response.statusText}. ${errorBody}`);
  }

  const gameRef = doc(db, "games", gameId);
  await deleteDoc(gameRef);

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function reuploadFiles(formData: FormData) {
    const gameId = formData.get('gameId');
    const backendUrl = formData.get('backendUrl');

    if (!gameId || !backendUrl) {
        throw new Error("Game ID or Backend URL is missing.");
    }
    
    // The Python server expects the id in the form data, not as a path parameter.
    formData.append('id', gameId as string);

    // We don't need to send the backendUrl in the body
    formData.delete('backendUrl');
    formData.delete('gameId');


    const response = await fetch(`${backendUrl}/reupload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Re-upload failed:", errorBody);
        throw new Error(`Re-upload failed: ${response.statusText}. ${errorBody}`);
    }
    revalidatePath('/');
    revalidatePath('/admin');
}