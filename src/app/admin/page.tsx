import GamesTable from "@/components/admin/games-table";
import BackendUrlConfig from "@/components/admin/backend-url-config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";


export default function AdminPage() {
  // Data fetching is now handled client-side in GamesTable
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-4xl font-bold text-primary">ゲーム管理パネル</h1>
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

      <GamesTable />
    </div>
  );
}
