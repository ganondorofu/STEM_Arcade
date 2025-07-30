'use server';

import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addGame(formData: FormData) {
  // This function now primarily handles adding the text data to Firestore.
  // The file upload to the Python server would happen separately or be triggered from here.
  // For now, we'll focus on the Firestore part.

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const markdownText = formData.get('markdownText') as string;
  // File data would be extracted here and sent to the Python server.
  // const zipFile = formData.get('zipFile') as File;
  // const thumbnailFile = formData.get('thumbnail') as File;

  if (!title || !description || !markdownText) {
    throw new Error('Missing required text fields');
  }

  // 1. Generate a unique ID (as per the design doc)
  const gameId = `game_${Math.random().toString(36).substring(2, 11)}`;
  
  // NOTE: Here you would typically make a fetch call to your Python server
  // await fetch('https://your-python-server.com/upload', {
  //   method: 'POST',
  //   body: formData, // The formData contains the files and text data
  // });
  // The Python server would handle saving the files and then adding the doc to Firestore.
  
  // For this demo, we'll simulate the Python server's Firestore action directly.
  console.log(`Simulating upload for game ID: ${gameId}`);

  // 2. Create a new game document in Firestore
  const newGame: Omit<Game, 'id'> = {
    title,
    description,
    markdownText,
    createdAt: { // We'll use a client-side timestamp for consistency in this mock
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0
    }
  };
  
  // The document ID in Firestore will be our generated gameId
  // This is a placeholder. A real implementation would use the Python server to write to Firestore.
   await addDoc(collection(db, "games"), {
    ...newGame,
    id: gameId, // saving id in the document as well
    createdAt: serverTimestamp() // Use server-side timestamp for accuracy
  });


  // 3. Revalidate paths to show the new game immediately
  revalidatePath('/');
  revalidatePath('/admin');
}
