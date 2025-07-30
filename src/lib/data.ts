// This file is now deprecated for games data, as it's fetched from Firestore.
// It is kept for the feedback data structure until that is also migrated.
import type { Feedback } from './types';


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
