'use server';

import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

interface SubmitFeedbackProps {
    gameId: string;
    comment: string;
    backendUrl: string;
}

export async function submitFeedback({ gameId, comment, backendUrl }: SubmitFeedbackProps) {
    if (!gameId || !comment || !backendUrl) {
        throw new Error('ゲームID、コメント、またはバックエンドURLがありません。');
    }

    // 1. Send feedback to Python server to be saved in a text file
    const formData = new FormData();
    formData.append('id', gameId);
    formData.append('text', comment);

    const response = await fetch(`${backendUrl}/feedback`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Feedback submission to backend failed:", errorBody);
        throw new Error(`フィードバックのバックエンドへの送信に失敗しました: ${response.statusText}. ${errorBody}`);
    }

    // 2. Save feedback to Firestore
    try {
        await addDoc(collection(db, 'feedbacks'), {
            gameId,
            comment,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error writing feedback to Firestore: ", error);
        // We don't re-throw here, as the primary storage (file) succeeded.
        // We can just log it. In a real-world app, you might want more robust error handling.
    }
}
