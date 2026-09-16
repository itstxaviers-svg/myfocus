export type Priority = 'low' | 'medium' | 'high';
export type Mood = 'great' | 'good' | 'neutral' | 'tired' | 'low';
export type Mode = 'focus' | 'shortBreak' | 'longBreak';
export interface Task { id:string; title:string; description?:string; status:'active'|'completed'; priority:Priority; scheduledDate?:string; scheduledTime?:string; estimatedMinutes?:number; createdAt:number; updatedAt:number; completedAt?:number; order:number; rewardedCompletionId?:string }
export interface FocusSession { id:string; taskId?:string; mode:'focus'; plannedMinutes:number; startedAt:number; completedAt:number; pointsAwarded:number }
export interface PointEvent { id:string; type:'task_completed'|'focus_completed'; points:number; createdAt:number; localDate:string; entityId:string }
export interface ActiveTimer { mode:Mode; status:'idle'|'running'|'paused'; taskId?:string; plannedSeconds:number; remainingSeconds:number; startedAt?:number; endsAt?:number }
export type IncomeCurrency = 'USD' | 'EUR' | 'GBP' | 'RUB';
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface Payment { id:string; amount:number; paidAt:string; note?:string; createdAt:number }
export interface Child { id:string; name:string; guardian?:string; contact?:string; notes?:string; payments:Payment[]; createdAt:number }
export interface Group { id:string; name:string; description?:string; scheduleWeekdays:Weekday[]; children:Child[]; createdAt:number }
export type AttendanceLedger = Record<string,Record<string,string[]>>;
export interface FocusToolState { schemaVersion:1; profile:{name:string}; checkIns:Record<string,{date:string;mood?:Mood;thought:string;updatedAt:number}>; tasks:Task[]; focusSessions:FocusSession[]; pointEvents:PointEvent[]; milestones:Record<string,{threeTasksCelebrated?:boolean;lastEncouragement?:number}>; activeTimer:ActiveTimer; focusSettings:{focusMinutes:number;shortBreakMinutes:number;longBreakMinutes:number;sessionsBeforeLongBreak:number;dailyFocusGoalMinutes:number;soundEnabled:boolean}; completedFocusCountSinceLongBreak:number; groups:Group[]; incomeCurrency:IncomeCurrency; attendance:AttendanceLedger }
