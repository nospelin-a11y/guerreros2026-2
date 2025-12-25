
import { User, Activity } from './types';

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'act-1', name: 'Crossfit', points: 1.0 },
  { id: 'act-2', name: 'Correr', points: 1.0 },
  { id: 'act-3', name: 'Musculación', points: 1.0 },
  { id: 'act-4', name: 'Bicicleta', points: 1.0 },
  { id: 'act-5', name: 'Pádel', points: 0.25 },
  { id: 'act-6', name: 'Baloncesto', points: 0.25 },
];

export const INITIAL_USERS: User[] = [
  { id: 'u-1', name: 'Juanmi', username: 'juanmi', password: 'g26', isAdmin: false },
  { id: 'u-2', name: 'Adri', username: 'adri', password: 'g26', isAdmin: false },
  { id: 'u-3', name: 'Joseluis', username: 'joseluis', password: 'g26', isAdmin: false },
  { id: 'u-4', name: 'Josevi', username: 'josevi', password: 'g26', isAdmin: false },
  { id: 'u-5', name: 'Pedro', username: 'pedro', password: 'g26', isAdmin: false },
  { id: 'u-6', name: 'Franju', username: 'franju', password: 'admin', isAdmin: true },
  { id: 'u-7', name: 'Sergio', username: 'sergio', password: 'g26', isAdmin: false },
  { id: 'u-8', name: 'Joseca', username: 'joseca', password: 'g26', isAdmin: false },
  { id: 'u-9', name: 'Juanma', username: 'juanma', password: 'g26', isAdmin: false },
];

export const STORAGE_KEY = 'guerreros_2026_data';
export const DAILY_WORKOUT_LIMIT = 2;
