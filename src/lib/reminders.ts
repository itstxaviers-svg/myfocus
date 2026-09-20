import type { FocusToolState } from '../types';
import { dateFromKey, localDateKey } from './dates';
import { addDaysKey, nextMarkerDate, nextPredictedStart } from './periods';

export type ReminderKind = 'task'|'period'|'marker'|'backup';
export interface ReminderItem { id:string; kind:ReminderKind; title:string; body:string; remindAt:number; dueAt:number }

const atLocalTime=(date:string,time='09:00')=>new Date(`${date}T${time}:00`).getTime();
const readable=(date:string)=>dateFromKey(date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

export const buildReminders = (state:FocusToolState,now=Date.now()):ReminderItem[] => {
  const taskItems=state.tasks.filter(task=>task.status==='active'&&task.scheduledDate&&(task.reminderMinutesBefore??60)>=0).map(task=>{
    const minutes=task.reminderMinutesBefore??60,dueAt=atLocalTime(task.scheduledDate!,task.scheduledTime||'09:00'),remindAt=dueAt-minutes*60_000;
    return {id:`task:${task.id}:${remindAt}`,kind:'task' as const,title:task.title,body:`Task due ${readable(task.scheduledDate!)}${task.scheduledTime?` at ${task.scheduledTime}`:''}`,remindAt,dueAt};
  });
  const markerItems=state.periodTracking.markers.flatMap(marker=>{
    let occurrence=nextMarkerDate(marker,localDateKey(new Date(now)));if(!occurrence)return [];
    let dueAt=atLocalTime(occurrence,marker.time||'09:00');
    if(marker.repeatDays){while(dueAt+86_400_000<now){occurrence=addDaysKey(occurrence,marker.repeatDays);dueAt=atLocalTime(occurrence,marker.time||'09:00')}}
    return (marker.reminderMinutesBefore.length?marker.reminderMinutesBefore:[0]).map(minutes=>{const remindAt=dueAt-Math.max(0,minutes)*60_000;return {id:`marker:${marker.id}:${occurrence}:${minutes}`,kind:'marker' as const,title:marker.title,body:marker.note||`Scheduled for ${readable(occurrence)} at ${marker.time||'09:00'}`,remindAt,dueAt}});
  });
  const predicted=nextPredictedStart(state.periodTracking,localDateKey(new Date(now)));
  const periodTime=state.periodTracking.settings.periodReminderTime||'09:00';
  const periodItems:ReminderItem[]=predicted?[{id:`period:${predicted}`,kind:'period',title:'Expected period',body:`Estimated start: ${readable(predicted)}`,remindAt:atLocalTime(addDaysKey(predicted,-Math.max(0,state.periodTracking.settings.periodReminderDaysBefore)),periodTime),dueAt:atLocalTime(predicted,periodTime)}]:[];
  const nowDate=new Date(now),month=`${nowDate.getFullYear()}-${String(nowDate.getMonth()+1).padStart(2,'0')}`,backupIsDue=!state.privacy.lastBackupAt||now-state.privacy.lastBackupAt>=30*86_400_000;
  const backupItems:ReminderItem[]=backupIsDue?[{id:`backup:${month}`,kind:'backup',title:'Back up Focus Tool',body:'Export a backup so your local data can be restored if this device is lost or cleared.',remindAt:atLocalTime(`${month}-01`),dueAt:atLocalTime(`${month}-${String(new Date(nowDate.getFullYear(),nowDate.getMonth()+1,0).getDate()).padStart(2,'0')}`,'23:59')}]:[];
  return [...taskItems,...markerItems,...periodItems,...backupItems].sort((a,b)=>a.remindAt-b.remindAt);
};

export const isReminderDue = (item:ReminderItem,now=Date.now()) => item.remindAt<=now&&now<=item.dueAt+86_400_000;
export const visibleReminders = (items:ReminderItem[],now=Date.now()) => items.filter(item=>item.dueAt>=now-86_400_000&&item.remindAt<=now+31*86_400_000);
