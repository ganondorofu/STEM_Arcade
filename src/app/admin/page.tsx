import GamesTable from "@/components/admin/games-table";
import { games, feedbacks } from "@/lib/data";

export default function AdminPage() {
  // In a real app, you'd fetch this from Firestore.
  // This is a server component, so you could do that directly here.
  const allGames = games;
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
