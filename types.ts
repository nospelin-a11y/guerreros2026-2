
export type ActivityType = 'Crossfit' | 'Correr' | 'Musculación' | 'Bicicleta' | 'Pádel' | 'Baloncesto' | 'Otro';

export interface Activity {
  id: string;
  name: string;
  points: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  is_admin: boolean; // Coincide con Supabase
  avatar?: string;
}

export interface Workout {
  id: string;
  user_id: string;      // Coincide con Supabase
  activity_id: string;  // Coincide con Supabase
  activity_name: string; // Coincide con Supabase
  date: string; 
  points: number;
  notes?: string;
}

export interface AppState {
  users: User[];
  workouts: Workout[];
  activities: Activity[];
}
