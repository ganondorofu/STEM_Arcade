'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function updateGame(gameId: string, title: string, description: string, markdownText: string): Promise<void> {
  if (!gameId || !title) {
    throw new Error("更新にはゲームIDとタイトルが必須です。");
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
    throw new Error('削除にはゲームIDが必要です。');
  }
   if (!backendUrl) {
    throw new Error('バックエンドURLが設定されていません。');
  }

  const formData = new FormData();
  formData.append('id', gameId);

  // 1. Delete files from the Python server
  const response = await fetch(`${backendUrl}/delete`, { 
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
     const errorBody = await response.text();
     console.error("バックエンドでのファイル削除に失敗しました:", errorBody);
     // Don't throw an error here, allow Firestore deletion to proceed
     // In a real app, you might want more robust error handling / logging
  }

  // 2. Delete the document from Firestore
  const gameRef = doc(db, "games", gameId);
  await deleteDoc(gameRef);

  // 3. Revalidate paths
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function reuploadFiles(formData: FormData) {
    const gameId = formData.get('id');
    const backendUrl = formData.get('backendUrl');

    if (!gameId || !backendUrl) {
        throw new Error("ゲームIDまたはバックエンドURLがありません。");
    }

    const response = await fetch(`${backendUrl}/reupload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("再アップロードに失敗しました:", errorBody);
        throw new Error(`再アップロードに失敗しました: ${response.statusText}. ${errorBody}`);
    }

    // Revalidate paths to show potential thumbnail changes
    revalidatePath('/');
    revalidatePath('/admin');
}
