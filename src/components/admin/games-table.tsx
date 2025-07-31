
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Game } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, MessageSquare, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EditGameDialog from '@/app/admin/edit-game-dialog';
import ViewFeedbackDialog from './view-feedback-dialog';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';


export default function GamesTable() {
  const [games, setGames] = useState<Game[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [gameForFeedback, setGameForFeedback] = useState<Game | null>(null);

  const [backendUrl, setBackendUrl] = useState('');
  const { toast } = useToast();

  const fetchGamesAndFeedback = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch games
      const gamesCollection = collection(db, 'games');
      const q = query(gamesCollection, orderBy('createdAt', 'desc'));
      const gameSnapshot = await getDocs(q);
      const gamesList = gameSnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          return {
              id: doc.id,
              title: data.title,
              description: data.description,
              markdownText: data.markdownText,
              createdAt: createdAt ? { seconds: createdAt.seconds, nanoseconds: createdAt.nanoseconds } : null,
          } as Game;
      });
      setGames(gamesList);

      // Fetch feedbacks
      const feedbackCollection = collection(db, 'feedbacks');
      const feedbackQuery = query(feedbackCollection, orderBy('createdAt', 'desc'));
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackList = feedbackSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp;
         return {
          id: doc.id,
          gameId: data.gameId,
          comment: data.comment,
          timestamp: createdAt.toDate(),
        }
      });
      setFeedbacks(feedbackList);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: 'データの読み込みに失敗',
        description: 'Firestoreからのデータ取得中にエラーが発生しました。',
        variant: 'destructive',
      })
    } finally {
      setLoading(false);
    }
  }, [toast]);


   useEffect(() => {
    const url = localStorage.getItem('backendUrl');
    if (url) {
      setBackendUrl(url);
    }
    fetchGamesAndFeedback();
  }, [fetchGamesAndFeedback]);

  const handleEdit = (game: Game) => {
    if (!backendUrl) {
      toast({ title: "バックエンドURL未設定", description: "操作の前に、管理者ページでバックエンドURLを設定してください。", variant: "destructive" });
      return;
    }
    setSelectedGame(game);
    setIsEditDialogOpen(true);
  };

  const handleViewFeedback = (game: Game) => {
    setGameForFeedback(game);
    setIsFeedbackDialogOpen(true);
  };

  const handleDelete = (game: Game) => {
    if (!backendUrl) {
      toast({ title: "バックエンドURL未設定", description: "操作の前に、管理者ページでバックエンドURLを設定してください。", variant: "destructive" });
      return;
    }
    setGameToDelete(game);
    setIsDeleteDialogOpen(true);
  }
  
  const confirmDelete = async () => {
    if (!gameToDelete || !backendUrl) return;
    try {
      // 1. Delete files from the Python server
      const formData = new FormData();
      formData.append('id', gameToDelete.id);
      const response = await fetch(`${backendUrl}/delete`, { 
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("バックエンドでのファイル削除に失敗しました:", errorBody);
        // Do not throw an error here, allow Firestore deletion to proceed
      }

      // 2. Delete the document from Firestore
      const gameRef = doc(db, "games", gameToDelete.id);
      await deleteDoc(gameRef);
      
      // Delete feedbacks for the game
      const feedbackQuery = query(collection(db, 'feedbacks'), where('gameId', '==', gameToDelete.id));
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const deletePromises = feedbackSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);


      // 3. Update local state
      setGames(games.filter(g => g.id !== gameToDelete.id));
      setFeedbacks(feedbacks.filter(f => f.gameId !== gameToDelete.id));

      toast({
        title: "ゲームを削除しました",
        description: `「${gameToDelete.title}」をアーケードから削除しました。`
      });
    } catch (error) {
       toast({
        title: "エラー",
        description: `ゲームの削除に失敗しました: ${error instanceof Error ? error.message : ''}`,
        variant: "destructive"
      });
    } finally {
        setIsDeleteDialogOpen(false);
        setGameToDelete(null);
    }
  }
  
  const handleGameUpdate = (updatedGame: Game) => {
    // If the ID has been modified to bust cache, it means we need to refetch
    // to get the new image URL properly.
    if (game.id !== updatedGame.id) {
       fetchGamesAndFeedback();
    } else {
       setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
    }
  }
  
  const formatDate = (date: any) => {
    if (!date || !date.seconds) return 'N/A';
    return format(new Date(date.seconds * 1000), 'yyyy-MM-dd');
  }


  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>ゲームリスト</CardTitle>
            <CardDescription>
                アーケードに現在登録されている全ゲームのリストです。
            </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>タイトル</TableHead>
                        <TableHead className="hidden md:table-cell">説明</TableHead>
                        <TableHead className="hidden lg:table-cell">追加日</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {games.length > 0 ? (
                            games.map((game) => (
                            <TableRow key={game.id}>
                                <TableCell className="font-medium">{game.title}</TableCell>
                                <TableCell className="hidden md:table-cell max-w-sm truncate">{game.description}</TableCell>
                                <TableCell className="hidden lg:table-cell">{formatDate(game.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">メニューを開く</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(game)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        編集
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewFeedback(game)}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        フィードバックを見る
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(game)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        削除
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    まだゲームが登録されていません。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            )}
        </CardContent>
      </Card>
      
      {selectedGame && (
        <EditGameDialog 
            key={selectedGame.id}
            isOpen={isEditDialogOpen}
            setIsOpen={(isOpen) => {
                setIsEditDialogOpen(isOpen);
                if (!isOpen) {
                    setSelectedGame(null);
                }
            }}
            game={selectedGame}
            onGameUpdate={handleGameUpdate}
            backendUrl={backendUrl}
        />
      )}

      {gameForFeedback && (
        <ViewFeedbackDialog 
            isOpen={isFeedbackDialogOpen}
            setIsOpen={(isOpen) => {
                setIsFeedbackDialogOpen(isOpen);
                if (!isOpen) {
                    setGameForFeedback(null);
                }
            }}
            game={gameForFeedback}
            feedbacks={feedbacks.filter(f => f.gameId === gameForFeedback.id)}
        />
      )}

      {gameToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                    この操作は取り消せません。ゲーム「{gameToDelete.title}」とその関連データ (ファイルとFirestoreドキュメント) が完全に削除されます。
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setGameToDelete(null)}>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">削除を続行</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
