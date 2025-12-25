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
  { id: 'Juanmi', name: 'Juanmi', username: 'juanmi', password: 'g26', is_admin: false },
  { id: 'Adri', name: 'Adri', username: 'adri', password: 'g26', is_admin: false },
  { id: 'Joseluis', name: 'Joseluis', username: 'joseluis', password: 'g26', is_admin: false },
  { id: 'Josevi', name: 'Josevi', username: 'josevi', password: 'g26', is_admin: false },
  { id: 'Pedro', name: 'Pedro', username: 'pedro', password: 'g26', is_admin: false },
  { id: 'Franju', name: 'Franju', username: 'franju', password: 'admin', is_admin: true },
  { id: 'Sergio', name: 'Sergio', username: 'sergio', password: 'g26', is_admin: false },
  { id: 'Joseca', name: 'Joseca', username: 'joseca', password: 'g26', is_admin: false },
  { id: 'Juanma', name: 'Juanma', username: 'juanma', password: 'g26', is_admin: false },
];

export const STORAGE_KEY = 'guerreros_2026_data';
export const DAILY_WORKOUT_LIMIT = 2;