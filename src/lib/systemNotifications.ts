import type { ReminderItem } from './reminders';

export type SystemNotificationPermission = NotificationPermission|'unsupported';

export const notificationPermission = ():SystemNotificationPermission => typeof window==='undefined'||!('Notification' in window)?'unsupported':Notification.permission;

export const requestSystemNotificationPermission = async ():Promise<SystemNotificationPermission> => {
  if(typeof window==='undefined'||!('Notification' in window))return 'unsupported';
  try{return await Notification.requestPermission()}catch{return 'denied'}
};

export const showSystemNotification = async (item:ReminderItem) => {
  if(notificationPermission()!=='granted')return false;
  const options:NotificationOptions={body:item.body,icon:`${import.meta.env.BASE_URL}icons/focus-tool-192.png`,badge:`${import.meta.env.BASE_URL}icons/favicon-32.png`,tag:item.id};
  try{
    if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.ready;await registration.showNotification(item.title,options);return true}
    new Notification(item.title,options);return true;
  }catch{return false}
};
