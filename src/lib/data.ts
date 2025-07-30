import type { Game, Feedback } from './types';

export const games: Game[] = [
  {
    id: 'game_space_escape',
    title: 'Space Escape',
    description: 'Solve puzzles to escape the abandoned spaceship!',
    thumbnailPath: 'https://placehold.co/600x400/f06292/ffffff',
    markdownPath: '/markdown/space_escape.md',
    gameUrl: '/games/placeholder/index.html',
    createdAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 'game_forest_quest',
    title: 'Forest Quest',
    description: 'An adventure game through an enchanted forest.',
    thumbnailPath: 'https://placehold.co/600x400/00bcd4/ffffff',
    markdownPath: '/markdown/forest_quest.md',
    gameUrl: '/games/placeholder/index.html',
    createdAt: new Date('2023-10-25T14:30:00Z'),
  },
  {
    id: 'game_cyber_racer',
    title: 'Cyber Racer',
    description: 'High-speed racing in a futuristic city.',
    thumbnailPath: 'https://placehold.co/600x400/f8bbd0/333333',
    markdownPath: '/markdown/cyber_racer.md',
    gameUrl: '/games/placeholder/index.html',
    createdAt: new Date('2023-10-24T18:00:00Z'),
  },
    {
    id: 'game_puzzle_world',
    title: 'Puzzle World',
    description: 'Challenge your mind with a variety of puzzles.',
    thumbnailPath: 'https://placehold.co/600x400/f06292/ffffff',
    markdownPath: '/markdown/puzzle_world.md',
    gameUrl: '/games/placeholder/index.html',
    createdAt: new Date('2023-10-23T09:00:00Z'),
  },
];

export const feedbacks: Feedback[] = [
  {
    id: 'feedback_1',
    gameId: 'game_space_escape',
    comment: 'Really fun puzzles, the atmosphere was great!',
    timestamp: new Date('2023-10-26T11:00:00Z'),
  },
  {
    id: 'feedback_2',
    gameId: 'game_space_escape',
    comment: 'I got stuck on level 3, but it was a good challenge.',
    timestamp: new Date('2023-10-26T12:45:00Z'),
  },
  {
    id: 'feedback_3',
    gameId: 'game_forest_quest',
    comment: 'Beautiful graphics and music. Very relaxing.',
    timestamp: new Date('2023-10-25T15:00:00Z'),
  },
];
