
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import type { Config } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Fetches the backend URL from the Firestore 'config/backend' document.
 * @returns {Promise<string>} The backend URL.
 */
export async function getBackendUrl(): Promise<string> {
    try {
        const configRef = doc(db, 'config', 'backend');
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
            const config = docSnap.data() as Config;
            return config.backendUrl || '';
        }
        return '';
    } catch (error) {
        console.error("Error fetching backend URL:", error);
        return '';
    }
}

/**
 * Saves the backend URL to the Firestore 'config/backend' document.
 * @param {string} url - The backend URL to save.
 */
export async function saveBackendUrl(url: string): Promise<{ success: boolean; error?: string }> {
     if (!url) {
        return { success: false, error: 'URLは空にできません。' };
    }
    try {
        // Basic URL validation
        new URL(url);
    } catch (error) {
        return { success: false, error: '無効なURL形式です。' };
    }

    try {
        const configRef = doc(db, 'config', 'backend');
        await setDoc(configRef, { backendUrl: url }, { merge: true });
        // Revalidate relevant paths that use the backendUrl
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/manage');
        revalidatePath('/games', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error saving backend URL:", error);
        const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。';
        return { success: false, error: errorMessage };
    }
}


/**
 * Updates a game document in Firestore.
 * @param {string} gameId - The ID of the game to update.
 * @param {string} title - The new title.
 * @param {string} description - The new description.
 * @param {string} markdownText - The new markdown text.
 */
export async function updateGame(gameId: string, title: string, description: string, markdownText: string) {
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, { title, description, markdownText });
    revalidatePath('/admin');
    revalidatePath('/manage');
}
