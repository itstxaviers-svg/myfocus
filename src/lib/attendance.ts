import type { AttendanceLedger, Child, Weekday } from '../types';

export const weekdayLabels: Record<Weekday,string> = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday',7:'Sunday'};
export const shortWeekdayLabels: Record<Weekday,string> = {1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat',7:'Sun'};
const weekdayOf = (date:Date):Weekday => (date.getDay()===0?7:date.getDay()) as Weekday;

export const lessonDatesForMonth = (monthKey:string, weekdays:Weekday[]) => {
  if (!/^\d{4}-\d{2}$/.test(monthKey) || weekdays.length===0) return [];
  const [year,month]=monthKey.split('-').map(Number), days=new Date(year,month,0).getDate(), allowed=new Set(weekdays);
  return Array.from({length:days},(_,index)=>index+1).filter(day=>allowed.has(weekdayOf(new Date(year,month-1,day)))).map(day=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
};

export const childAttendance = (ledger:AttendanceLedger,groupId:string,child:Child,dates:string[]) => {
  const attended=dates.filter(date=>ledger[groupId]?.[date]?.includes(child.id));
  return {attended,missed:dates.filter(date=>!attended.includes(date)),rate:dates.length?Math.round(attended.length/dates.length*100):0};
};

export const attendanceRate = (ledger:AttendanceLedger,groupId:string,children:Child[],dates:string[]) => {
  const possible=children.length*dates.length;
  if (!possible) return 0;
  const present=children.reduce((sum,child)=>sum+childAttendance(ledger,groupId,child,dates).attended.length,0);
  return Math.round(present/possible*100);
};

export const toggleAttendancePresence = (ledger:AttendanceLedger,groupId:string,date:string,childId:string):AttendanceLedger => {
  const present=ledger[groupId]?.[date]||[],next=present.includes(childId)?present.filter(id=>id!==childId):[...present,childId];
  return {...ledger,[groupId]:{...(ledger[groupId]||{}),[date]:next}};
};
