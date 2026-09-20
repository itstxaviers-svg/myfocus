import type { ReminderItem } from './reminders';

export type SystemNotificationPermission = NotificationPermission|'unsupported';

export const notificationPermission = ():SystemNotificationPermission => typeof window==='undefined'||!('Notification' in window)?'unsupported':Notification.permission;

export const requestSystemNotificationPermission = async ():Promise<SystemNotificationPermission> => {
  if(typeof window==='undefined'||!('Notification' in window))return 'unsupported';
  try{return await Notification.requestPermission()}catch{return 'denied'}
};

export const showSystemNotification = async (item:ReminderItem,privateMode=false) => {
  if(notificationPermission()!=='granted')return false;
  const options:NotificationOptions={body:privateMode?'Open Focus Tool to view your personal reminder.':item.body,icon:`${import.meta.env.BASE_URL}icons/focus-tool-192.png`,badge:`${import.meta.env.BASE_URL}icons/favicon-32.png`,tag:item.id,data:{url:import.meta.env.BASE_URL}};
  try{
    const title=privateMode?'Focus Tool reminder':item.title;
    if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.ready;await registration.showNotification(title,options);return true}
    new Notification(title,options);return true;
  }catch{return false}
};

export const syncReminderSchedule = async (items:ReminderItem[],privateMode:boolean) => {
  if(!('serviceWorker' in navigator))return;
  try{const registration=await navigator.serviceWorker.ready;registration.active?.postMessage({type:'SCHEDULE_REMINDERS',privateMode,items:items.filter(item=>item.remindAt>Date.now()).slice(0,100)});await (registration as ServiceWorkerRegistration&{sync?:{register:(tag:string)=>Promise<void>}}).sync?.register('focus-tool-reminders')}catch{/* In-app reminders remain available. */}
};
