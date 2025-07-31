
'use client';

import { useState, useCallback } from "react";
import AddGameForm from "@/components/add-game-form";
import GamesTable from "@/components/admin/games-table";
import BackendUrlConfig from "@/components/admin/backend-url-config";

export default function ManagePageContent() {
  const [key, setKey] = useState(0);
  const [backendUrl, setBackendUrl] = useState('');

  const handleGameAdded = useCallback(() => {
    // Force re-render of GamesTable by changing its key
    setKey(prevKey => prevKey + 1);
  }, []);
  
  const handleUrlChange = (newUrl: string) => {
    setBackendUrl(newUrl);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">ゲーム管理ページ</h1>
        <p className="mt-2 text-muted-foreground">
          ゲームの追加、編集、削除を行えます。
        </p>
      </div>

      <BackendUrlConfig onUrlChange={handleUrlChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AddGameForm key={key} onGameAdded={handleGameAdded} backendUrl={backendUrl}/>
        </div>
        <div className="md:col-span-2">
          <GamesTable key={key} backendUrl={backendUrl} onGameUpdate={handleGameAdded} />
        </div>
      </div>
    </div>
  );
}
