import type { FocusToolState } from '../types';
const key = 'focus-tool:v1';
export const defaults = (): FocusToolState => ({ schemaVersion:1, profile:{name:''}, checkIns:{}, tasks:[], focusSessions:[], pointEvents:[], milestones:{}, activeTimer:{mode:'focus',status:'idle',plannedSeconds:1500,remainingSeconds:1500}, focusSettings:{focusMinutes:25,shortBreakMinutes:5,longBreakMinutes:20,sessionsBeforeLongBreak:4,dailyFocusGoalMinutes:90,soundEnabled:false}, completedFocusCountSinceLongBreak:0 });
export const load = (): FocusToolState => { try { const raw=localStorage.getItem(key); if (!raw) return defaults(); const x=JSON.parse(raw); return x?.schemaVersion===1 ? x : defaults(); } catch(e) { console.warn('Focus Tool storage could not be read',e); return defaults(); } };
export const save = (state: FocusToolState) => { try { localStorage.setItem(key, JSON.stringify(state)); return true; } catch(e) { console.warn('Focus Tool storage could not be saved',e); return false; } };
export const resetStorage = () => { try { localStorage.removeItem(key); } catch(e) { console.warn('Focus Tool storage could not be reset',e); } };
