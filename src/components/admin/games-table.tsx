'use client';

import { useState } from 'react';
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

interface GamesTableProps {
  initialGames: Game[];
  initialFeedbacks: Feedback[];
}

export default function GamesTable({ initialGames, initialFeedbacks }: GamesTableProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { toast } = useToast();

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setIsEditDialogOpen(true);
  };

  const handleViewFeedback = (game: Game) => {
    setSelectedGame(game);
    setIsFeedbackDialogOpen(true);
  };

  const handleDelete = (game: Game) => {
    setSelectedGame(game);
    setIsDeleteDialogOpen(true);
  }
  
  const confirmDelete = async () => {
    if (!selectedGame) return;
    try {
      await deleteGame(selectedGame.id);
      setGames(games.filter(g => g.id !== selectedGame.id));
      toast({
        title: "Game Deleted",
        description: `"${selectedGame.title}" has been removed from the arcade.`
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete the game.",
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


  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Game Management</CardTitle>
            <CardDescription>
                A list of all games currently in the arcade.
            </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden lg:table-cell">Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell className="hidden md:table-cell max-w-sm truncate">{game.description}</TableCell>
                <TableCell className="hidden lg:table-cell">{new Date(game.createdAt).toLocaleDateString()}</TableCell>
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
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewFeedback(game)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Feedback
                      </DropdownMenuItem>
                       <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(game)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Game
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      {selectedGame && (
        <>
            <EditGameDialog 
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                game={selectedGame}
                onGameUpdate={handleUpdateGame}
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
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        game "{selectedGame.title}" and all of its associated data.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </>
  );
}
