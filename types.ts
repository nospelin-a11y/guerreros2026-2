
export type ActivityType = 'Crossfit' | 'Correr' | 'Musculación' | 'Bicicleta' | 'Pádel' | 'Baloncesto' | 'Otro';

export interface Activity {
  id: string;
  name: ActivityType;
  points: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  isAdmin: boolean;
  avatar?: string;
}

export interface Workout {
  id: string;
  userId: string;
  activityId: string;
  activityName: string;
  date: string; // ISO string
  points: number;
  notes?: string;
}

export interface AppState {
  users: User[];
  workouts: Workout[];
  activities: Activity[];
}
