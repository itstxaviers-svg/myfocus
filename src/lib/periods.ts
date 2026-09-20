import type { PeriodMarker,PeriodTracking } from '../types';
import { dateFromKey, localDateKey } from './dates';

export const addDaysKey = (key:string,days:number) => {
  const date=dateFromKey(key);
  date.setDate(date.getDate()+days);
  return localDateKey(date);
};

export const periodStartDates = (days:PeriodTracking['days']) => Object.keys(days).sort().filter((key,index,all)=>index===0||all[index-1]!==addDaysKey(key,-1));

export const predictedPeriodDates = (tracking:PeriodTracking,monthKey:string) => {
  if(!tracking.settings.predictionEnabled)return [];
  const starts=periodStartDates(tracking.days),last=starts[starts.length-1];
  if(!last)return [];
  const cycle=Math.max(15,Math.min(60,tracking.settings.averageCycleDays||28));
  const length=Math.max(1,Math.min(14,tracking.settings.averagePeriodDays||5));
  let start=addDaysKey(last,cycle);
  const first=`${monthKey}-01`,after=addDaysKey(first,42);
  while(start<first)start=addDaysKey(start,cycle);
  const result:string[]=[];
  while(start<after){for(let day=0;day<length;day++){const key=addDaysKey(start,day);if(key.startsWith(`${monthKey}-`))result.push(key)}start=addDaysKey(start,cycle)}
  return result;
};

export const nextPredictedStart = (tracking:PeriodTracking,from=localDateKey()) => {
  if(!tracking.settings.predictionEnabled)return undefined;
  const starts=periodStartDates(tracking.days),last=starts[starts.length-1];
  if(!last)return undefined;
  const cycle=Math.max(15,Math.min(60,tracking.settings.averageCycleDays||28));
  let next=addDaysKey(last,cycle);
  while(next<from)next=addDaysKey(next,cycle);
  return next;
};

export const nextMarkerDate = (marker:PeriodMarker,from=localDateKey()) => {
  if(marker.completedAt&&!marker.repeatDays)return undefined;
  let date=marker.date;
  if(marker.repeatDays)while(date<from)date=addDaysKey(date,marker.repeatDays);
  return date;
};
