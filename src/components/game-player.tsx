'use client';

import { useRef, useState, useEffect } from 'react';
import type { Game } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import FeedbackForm from './feedback-form';

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
}

// A simple Markdown-to-HTML converter
const SimpleMarkdown = ({ text }: { text: string }) => {
  const html = text
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
      if (line.trim() === '---') return `<hr class="my-4 border-border" />`;
      if (line.trim() === '') return `<br />`;
      return `<p>${line}</p>`;
    })
    .join('');

  return <div className="prose prose-sm max-w-none text-card-foreground" dangerouslySetInnerHTML={{ __html: html }} />;
};


export default function GamePlayer({ game, onClose }: GamePlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [markdown, setMarkdown] = useState('Now Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkdown() {
      setIsLoading(true);
      try {
        // In a real app, you would fetch this from a URL or a backend service.
        // We simulate a fetch here.
        const mockMarkdown = `
# How to Play ${game.title}

Welcome to the game! Here are the basic controls and objectives.

## Controls
- **Arrow Keys**: Move your character
- **Spacebar**: Jump
- **Mouse**: Look around

## Story
${game.description} Embark on an epic journey to save the festival!

---

*Good luck, have fun!*
    `;
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setMarkdown(mockMarkdown);
      } catch (error) {
        setMarkdown('Failed to load game description.');
      } finally {
        setIsLoading(false);
      }
    }

    if (game.markdownPath) {
      fetchMarkdown();
    } else {
        setMarkdown('No description available for this game.');
        setIsLoading(false);
    }
  }, [game]);

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;

    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-primary">{game.title}</h2>
        <Button variant="ghost" onClick={onClose}>
          <XCircle className="mr-2" />
          Close Game
        </Button>
      </div>
      
      <div ref={iframeContainerRef} className="relative w-full aspect-video bg-black rounded-lg shadow-2xl mb-8">
        <iframe
          src={game.gameUrl}
          title={game.title}
          className="w-full h-full border-0 rounded-lg"
          allow="fullscreen"
        />
        <Button
          onClick={toggleFullscreen}
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-3 text-primary"/>
              About This Game
            </CardTitle>
            <CardDescription>Instructions, story, and credits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-md bg-background min-h-[150px]">
               {isLoading ? <p>Now Loading...</p> : <SimpleMarkdown text={markdown} />}
            </div>
          </CardContent>
        </Card>
        
        <FeedbackForm gameId={game.id} />
      </div>
    </div>
  );
}
