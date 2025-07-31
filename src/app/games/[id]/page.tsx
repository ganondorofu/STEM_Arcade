
import { db } from "@/lib/firebase";
import { Game } from "@/lib/types";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import GamePlayer from "@/components/game-player";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getBackendUrl, incrementViewCount } from "@/app/admin/actions";

export const revalidate = 60; // Revalidate every 60 seconds

async function getGame(id: string): Promise<Game | null> {
    try {
        const gameRef = doc(db, 'games', id);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            return null;
        }

        const data = gameSnap.data();
        const createdAt = data.createdAt as Timestamp | undefined;

        return {
            id: gameSnap.id,
            title: data.title,
            description: data.description,
            markdownText: data.markdownText,
            createdAt: createdAt ? { seconds: createdAt.seconds, nanoseconds: createdAt.nanoseconds } : null,
            viewCount: data.viewCount || 0,
        } as Game;

    } catch (error) {
        console.error("Error fetching game:", error);
        return null;
    }
}


export default async function GamePage({ params }: { params: { id: string } }) {
    // Increment view count first, then fetch data
    await incrementViewCount(params.id);

    const [game, backendUrl] = await Promise.all([
        getGame(params.id),
        getBackendUrl(),
    ]);

    if (!game) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2" />
                        アーケードに戻る
                    </Link>
                </Button>
            </div>
            <GamePlayer game={game} backendUrl={backendUrl} />
        </div>
    );
}
