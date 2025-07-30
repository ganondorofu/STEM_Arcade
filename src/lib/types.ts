export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailPath: string;
  markdownPath: string;
  gameUrl: string;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  gameId: string;
  comment: string;
  timestamp: Date;
}
