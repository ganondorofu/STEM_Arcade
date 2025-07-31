
'use client';

import { useState, useCallback, useEffect } from "react";
import AddGameForm from "@/components/add-game-form";
import GamesTable from "@/components/admin/games-table";
import BackendUrlConfig from "@/components/admin/backend-url-config";
import { getBackendUrl } from "@/app/admin/actions";
import { Skeleton } from "./ui/skeleton";

interface ManagePageContentProps {
  showBackendConfig?: boolean;
}

export default function ManagePageContent({ showBackendConfig = false }: ManagePageContentProps) {
  // Use a key to force re-render of child components when a game is added/updated
  const [key, setKey] = useState(0); 
  const [backendUrl, setBackendUrl] = useState<string | null>(null);

  const handleGameListUpdate = useCallback(() => {
    // Force re-render of GamesTable and AddGameForm by changing their key
    setKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    async function fetchUrl() {
      const url = await getBackendUrl();
      setBackendUrl(url);
    }
    fetchUrl();
  }, [key]); // Re-fetch if key changes, e.g., after URL save

  if (backendUrl === null) {
      return (
        <div className="space-y-8">
            <div className="text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
            </div>
            {showBackendConfig && <Skeleton className="h-40 w-full" />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1"><Skeleton className="h-96 w-full" /></div>
              <div className="md:col-span-2"><Skeleton className="h-96 w-full" /></div>
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">ゲーム管理ページ</h1>
        <p className="mt-2 text-muted-foreground">
          ゲームの追加、編集、削除を行えます。
        </p>
      </div>

      {showBackendConfig && <BackendUrlConfig />}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AddGameForm key={`add-${key}`} onGameAdded={handleGameListUpdate} backendUrl={backendUrl}/>
        </div>
        <div className="md:col-span-2">
          <GamesTable key={`table-${key}`} backendUrl={backendUrl} onGameUpdate={handleGameListUpdate} />
        </div>
      </div>
    </div>
  );
}
