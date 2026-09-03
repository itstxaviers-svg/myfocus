import type { FocusToolState, Priority } from '../types';
import { localDateKey } from './dates';
export const taskPoints = (p: Priority) => p === 'high' ? 20 : p === 'medium' ? 15 : 10;
export const focusPoints = (minutes: number) => Math.max(3, Math.round(minutes * .6));
export const totalPoints = (s: FocusToolState) => s.pointEvents.reduce((a, e) => a + e.points, 0);
export const todayTasks = (s: FocusToolState, date = localDateKey()) => s.tasks.filter(t => t.scheduledDate === date);
export const completedToday = (s: FocusToolState, date = localDateKey()) => s.tasks.filter(t => t.status === 'completed' && t.completedAt && localDateKey(new Date(t.completedAt)) === date);
export const focusMinutesToday = (s: FocusToolState, date = localDateKey()) => s.focusSessions.filter(x => localDateKey(new Date(x.completedAt)) === date).reduce((a, x) => a + x.plannedMinutes, 0);
export const pointsToday = (s: FocusToolState, date = localDateKey()) => s.pointEvents.filter(x => x.localDate === date).reduce((a, x) => a + x.points, 0);
export const efficiency = (s: FocusToolState, date = localDateKey()) => {
  const all = todayTasks(s, date), completed = completedToday(s, date).length, focus = Math.min(focusMinutesToday(s, date) / s.focusSettings.dailyFocusGoalMinutes, 1), task = all.length ? completed / all.length : 0;
  return Math.round(Math.min(1, all.length && focus ? task * .65 + focus * .35 : all.length ? task : focus) * 100);
};
