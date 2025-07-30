import GamesTable from "@/components/admin/games-table";
import { feedbacks } from "@/lib/data";
import { Game } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

async function getGames(): Promise<Game[]> {
    try {
        const gamesCollection = collection(db, 'games');
        const q = query(gamesCollection, orderBy('createdAt', 'desc'));
        const gameSnapshot = await getDocs(q);
        const gamesList = gameSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Game));
        return gamesList;
    } catch (error) {
        console.error("Failed to fetch games for admin page:", error);
        return [];
    }
}


export default async function AdminPage() {
  const allGames = await getGames();
  const allFeedbacks = feedbacks;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary">Admin Panel</h1>
        <p className="mt-2 text-muted-foreground">
          Manage games, view feedback, and keep the arcade running smoothly.
        </p>
      </div>

      <GamesTable initialGames={allGames} initialFeedbacks={allFeedbacks} />
    </div>
  );
}
