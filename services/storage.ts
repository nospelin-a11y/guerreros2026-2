
import { AppState, User, Workout, Activity } from '../types';
import { STORAGE_KEY, INITIAL_USERS, INITIAL_ACTIVITIES } from '../constants';

const initialState: AppState = {
  users: INITIAL_USERS,
  workouts: [],
  activities: INITIAL_ACTIVITIES,
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return initialState;
    }
    return JSON.parse(serialized);
  } catch (err) {
    return initialState;
  }
};

export const saveState = (state: AppState) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("No se pudo guardar el estado", err);
  }
};
