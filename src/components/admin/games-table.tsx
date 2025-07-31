
'use client';

import { useEffect, useState } from 'react';
import type { Game, Feedback } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, MessageSquare } from 'lucide-react';
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
import EditGameDialog from './edit-game-dialog';
import ViewFeedbackDialog from './view-feedback-dialog';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { deleteGame } from '@/app/admin/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


interface GamesTableProps {
  initialGames: Game[];
  initialFeedbacks: Feedback[];
}

export default function GamesTable({ initialGames, initialFeedbacks }: GamesTableProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [feedbacks] = useState<Feedback[]>(initialFeedbacks);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [backendUrl, setBackendUrl] = useState('');
  const { toast } = useToast();

   useEffect(() => {
    const url = localStorage.getItem('backendUrl');
    if (url) {
      setBackendUrl(url);
    }
  }, []);

  const handleEdit = (game: Game) => {
    if (!backendUrl) {
      toast({ title: "バックエンドURL未設定", description: "操作の前に、管理者ページでバックエンドURLを設定してください。", variant: "destructive" });
      return;
    }
    setSelectedGame(game);
    setIsEditDialogOpen(true);
  };

  const handleViewFeedback = (game: Game) => {
    setSelectedGame(game);
    setIsFeedbackDialogOpen(true);
  };

  const handleDelete = (game: Game) => {
    if (!backendUrl) {
      toast({ title: "バックエンドURL未設定", description: "操作の前に、管理者ページでバックエンドURLを設定してください。", variant: "destructive" });
      return;
    }
    setSelectedGame(game);
    setIsDeleteDialogOpen(true);
  }
  
  const confirmDelete = async () => {
    if (!selectedGame || !backendUrl) return;
    try {
      await deleteGame(selectedGame.id, backendUrl);
      setGames(games.filter(g => g.id !== selectedGame.id));
      toast({
        title: "ゲームを削除しました",
        description: `「${selectedGame.title}」をアーケードから削除しました。`
      });
    } catch (error) {
       toast({
        title: "エラー",
        description: `ゲームの削除に失敗しました: ${error instanceof Error ? error.message : ''}`,
        variant: "destructive"
      });
    } finally {
        setIsDeleteDialogOpen(false);
        setSelectedGame(null);
    }
  }
  
  const handleUpdateGame = (updatedGame: Game) => {
      setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
  }
  
  const formatDate = (date: any) => {
    if (!date || !date.seconds) return 'N/A';
    return format(new Date(date.seconds * 1000), 'yyyy-MM-dd');
  }


  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>ゲーム管理</CardTitle>
            <CardDescription>
                アーケードに現在登録されている全ゲームのリストです。
            </CardDescription>
        </CardHeader>
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
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell className="hidden md:table-cell max-w-sm truncate">{game.description}</TableCell>
                <TableCell className="hidden lg:table-cell">{formatDate(game.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
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
                       <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(game)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {games.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        ゲームが見つかりません。
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      {selectedGame && (
        <>
            <EditGameDialog 
                key={selectedGame.id}
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                game={selectedGame}
                onGameUpdate={handleUpdateGame}
                backendUrl={backendUrl}
            />
            <ViewFeedbackDialog 
                isOpen={isFeedbackDialogOpen}
                setIsOpen={setIsFeedbackDialogOpen}
                game={selectedGame}
                feedbacks={feedbacks.filter(f => f.gameId === selectedGame.id)}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        この操作は取り消せません。ゲーム「{selectedGame.title}」とその関連データ (ファイルとFirestoreドキュメント) が完全に削除されます。
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>削除を続行</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </>
  );
}
