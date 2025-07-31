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
      if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold mt-4 mb-2 text-primary">${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2 class="text-xl font-semibold mt-3 mb-1">${line.substring(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3 class="text-lg font-semibold mt-2 mb-1">${line.substring(4)}</h3>`;
      if (line.trim() === '---') return `<hr class="my-4 border-border" />`;
      if (line.trim() === '') return `<br />`;
      return `<p class="text-muted-foreground">${line}</p>`;
    })
    .join('');

  return <div className="prose prose-sm max-w-none text-card-foreground" dangerouslySetInnerHTML={{ __html: html }} />;
};


export default function GamePlayer({ game, onClose }: GamePlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  
  // The rewrite in next.config.ts will handle proxying this to the backend
  const gameUrl = `/games/${game.id}/`;

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;

    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().catch(err => {
        alert(`全画面表示への切り替えに失敗しました: ${err.message} (${err.name})`);
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
          ゲームを閉じる
        </Button>
      </div>
      
      <div ref={iframeContainerRef} className="relative w-full aspect-video bg-black rounded-lg shadow-2xl mb-8">
        <iframe
          src={gameUrl}
          title={game.title}
          className="w-full h-full border-0 rounded-lg"
          allow="fullscreen"
        />
        <Button
          onClick={toggleFullscreen}
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10"
          aria-label={isFullscreen ? '全画面表示を終了' : '全画面表示にする'}
        >
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-3 text-primary"/>
              ゲームについて
            </CardTitle>
            <CardDescription>操作方法、ストーリー、クレジットなど</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-md bg-background min-h-[150px]">
               <SimpleMarkdown text={game.markdownText} />
            </div>
          </CardContent>
        </Card>
        
        <FeedbackForm gameId={game.id} />
      </div>
    </div>
  );
}
