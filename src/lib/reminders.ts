import type { FocusToolState } from '../types';
import { dateFromKey, localDateKey } from './dates';
import { addDaysKey, nextPredictedStart } from './periods';

export type ReminderKind = 'task'|'period'|'marker';
export interface ReminderItem { id:string; kind:ReminderKind; title:string; body:string; remindAt:number; dueAt:number }

const atLocalTime=(date:string,time='09:00')=>new Date(`${date}T${time}:00`).getTime();
const readable=(date:string)=>dateFromKey(date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

export const buildReminders = (state:FocusToolState,now=Date.now()):ReminderItem[] => {
  const taskItems=state.tasks.filter(task=>task.status==='active'&&task.scheduledDate&&(task.reminderMinutesBefore??60)>=0).map(task=>{
    const minutes=task.reminderMinutesBefore??60,dueAt=atLocalTime(task.scheduledDate!,task.scheduledTime||'09:00'),remindAt=dueAt-minutes*60_000;
    return {id:`task:${task.id}:${remindAt}`,kind:'task' as const,title:task.title,body:`Task due ${readable(task.scheduledDate!)}${task.scheduledTime?` at ${task.scheduledTime}`:''}`,remindAt,dueAt};
  });
  const markerItems=state.periodTracking.markers.map(marker=>{
    const remindDate=addDaysKey(marker.date,-Math.max(0,marker.remindDaysBefore)),dueAt=atLocalTime(marker.date),remindAt=atLocalTime(remindDate);
    return {id:`marker:${marker.id}:${remindAt}`,kind:'marker' as const,title:marker.title,body:marker.note||`Scheduled for ${readable(marker.date)}`,remindAt,dueAt};
  });
  const predicted=nextPredictedStart(state.periodTracking,localDateKey(new Date(now)));
  const periodItems:ReminderItem[]=predicted?[{id:`period:${predicted}`,kind:'period',title:'Expected period',body:`Estimated start: ${readable(predicted)}`,remindAt:atLocalTime(addDaysKey(predicted,-Math.max(0,state.periodTracking.settings.periodReminderDaysBefore))),dueAt:atLocalTime(predicted)}]:[];
  return [...taskItems,...markerItems,...periodItems].sort((a,b)=>a.remindAt-b.remindAt);
};

export const isReminderDue = (item:ReminderItem,now=Date.now()) => item.remindAt<=now&&now<=item.dueAt+86_400_000;
export const visibleReminders = (items:ReminderItem[],now=Date.now()) => items.filter(item=>item.dueAt>=now-86_400_000&&item.remindAt<=now+31*86_400_000);
