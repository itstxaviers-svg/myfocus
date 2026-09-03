export type Priority = 'low' | 'medium' | 'high';
export type Mood = 'great' | 'good' | 'neutral' | 'tired' | 'low';
export type Mode = 'focus' | 'shortBreak' | 'longBreak';
export interface Task { id:string; title:string; description?:string; status:'active'|'completed'; priority:Priority; scheduledDate?:string; scheduledTime?:string; estimatedMinutes?:number; createdAt:number; updatedAt:number; completedAt?:number; order:number; rewardedCompletionId?:string }
export interface FocusSession { id:string; taskId?:string; mode:'focus'; plannedMinutes:number; startedAt:number; completedAt:number; pointsAwarded:number }
export interface PointEvent { id:string; type:'task_completed'|'focus_completed'; points:number; createdAt:number; localDate:string; entityId:string }
export interface ActiveTimer { mode:Mode; status:'idle'|'running'|'paused'; taskId?:string; plannedSeconds:number; remainingSeconds:number; startedAt?:number; endsAt?:number }
export interface FocusToolState { schemaVersion:1; profile:{name:string}; checkIns:Record<string,{date:string;mood?:Mood;thought:string;updatedAt:number}>; tasks:Task[]; focusSessions:FocusSession[]; pointEvents:PointEvent[]; milestones:Record<string,{threeTasksCelebrated?:boolean;lastEncouragement?:number}>; activeTimer:ActiveTimer; focusSettings:{focusMinutes:number;shortBreakMinutes:number;longBreakMinutes:number;sessionsBeforeLongBreak:number;dailyFocusGoalMinutes:number;soundEnabled:boolean}; completedFocusCountSinceLongBreak:number }
