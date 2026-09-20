import { describe,expect,it } from 'vitest';
import type { FocusToolState,PeriodTracking } from '../types';
import { defaults } from '../repositories/localProgressRepository';
import { nextPredictedStart,periodStartDates,predictedPeriodDates } from './periods';
import { buildReminders,isReminderDue } from './reminders';

const tracking:PeriodTracking={days:{'2026-09-01':{updatedAt:1},'2026-09-02':{updatedAt:1},'2026-09-29':{updatedAt:1}},markers:[],settings:{predictionEnabled:true,averageCycleDays:28,averagePeriodDays:5,periodReminderDaysBefore:1}};

describe('period tracking',()=>{
  it('finds starts of separately recorded periods',()=>expect(periodStartDates(tracking.days)).toEqual(['2026-09-01','2026-09-29']));
  it('predicts only when enabled',()=>{expect(nextPredictedStart(tracking,'2026-09-30')).toBe('2026-10-27');expect(nextPredictedStart({...tracking,settings:{...tracking.settings,predictionEnabled:false}},'2026-09-30')).toBeUndefined()});
  it('returns predicted days in the requested month',()=>expect(predictedPeriodDates(tracking,'2026-10')).toEqual(['2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31']));
});

describe('reminders',()=>{
  it('builds task and marker reminders with lead time',()=>{const state:FocusToolState={...defaults(),tasks:[{id:'t',title:'Lesson plan',status:'active',priority:'medium',scheduledDate:'2026-09-20',scheduledTime:'10:00',reminderMinutesBefore:60,createdAt:1,updatedAt:1,order:0}],periodTracking:{...tracking,markers:[{id:'m',title:'Remove vaginal ring',date:'2026-09-22',remindDaysBefore:1,createdAt:1}]}};const items=buildReminders(state,new Date('2026-09-20T08:00:00').getTime());expect(items.some(item=>item.kind==='task')).toBe(true);expect(items.find(item=>item.kind==='marker')?.remindAt).toBe(new Date('2026-09-21T09:00:00').getTime())});
  it('marks reminders due inside their active window',()=>{const item={id:'x',kind:'marker' as const,title:'Ring',body:'',remindAt:100,dueAt:200};expect(isReminderDue(item,150)).toBe(true);expect(isReminderDue(item,50)).toBe(false)});
});
