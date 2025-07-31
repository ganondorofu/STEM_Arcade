
export interface Game {
  id: string;
  title: string;
  description: string;
  markdownText: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface Feedback {
  id: string;
  gameId: string;
  comment: string;
  timestamp: Date;
}

export interface Config {
  backendUrl?: string;
}
