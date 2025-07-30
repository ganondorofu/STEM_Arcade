import GamesTable from "@/components/admin/games-table";
import { feedbacks } from "@/lib/data";
import { Game } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import BackendUrlConfig from "@/components/admin/backend-url-config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

async function getGames(): Promise<Game[]> {
    try {
        const gamesCollection = collection(db, 'games');
        const q = query(gamesCollection, orderBy('createdAt', 'desc'));
        const gameSnapshot = await getDocs(q);
        const gamesList = gameSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Game));
        return gamesList;
    } catch (error) {
        console.error("管理者ページのゲーム読み込みに失敗しました:", error);
        return [];
    }
}


export default async function AdminPage() {
  const allGames = await getGames();
  const allFeedbacks = feedbacks;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-4xl font-bold text-primary">管理者パネル</h1>
                <p className="mt-2 text-muted-foreground">
                ゲームの管理、フィードバックの確認などを行えます。
                </p>
            </div>
             <Button asChild>
                <Link href="/add-game">
                    <PlusCircle className="mr-2" />
                    新しいゲームを追加
                </Link>
            </Button>
        </div>
       
        <BackendUrlConfig />
      </div>

      <GamesTable initialGames={allGames} initialFeedbacks={allFeedbacks} />
    </div>
  );
}
