import { describe,expect,it } from 'vitest';
import type { FocusToolState,PeriodTracking } from '../types';
import { defaults } from '../repositories/localProgressRepository';
import { nextMarkerDate,nextPredictedStart,periodStartDates,predictedPeriodDates,RING_REPEAT_DAYS } from './periods';
import { buildReminders,isReminderDue } from './reminders';

const tracking:PeriodTracking={days:{'2026-09-01':{updatedAt:1},'2026-09-02':{updatedAt:1},'2026-09-29':{updatedAt:1}},markers:[],settings:{predictionEnabled:true,averageCycleDays:28,averagePeriodDays:5,periodReminderDaysBefore:1,periodReminderTime:'09:00'}};

describe('period tracking',()=>{
  it('finds starts of separately recorded periods',()=>expect(periodStartDates(tracking.days)).toEqual(['2026-09-01','2026-09-29']));
  it('predicts only when enabled',()=>{expect(nextPredictedStart(tracking,'2026-09-30')).toBe('2026-10-27');expect(nextPredictedStart({...tracking,settings:{...tracking.settings,predictionEnabled:false}},'2026-09-30')).toBeUndefined()});
  it('returns predicted days in the requested month',()=>expect(predictedPeriodDates(tracking,'2026-10')).toEqual(['2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31']));
  it('moves a recurring personal reminder to its next occurrence',()=>expect(nextMarkerDate({id:'m',title:'Ring',date:'2026-09-01',time:'09:00',reminderMinutesBefore:[1440],repeatDays:21,createdAt:1},'2026-09-30')).toBe('2026-10-13'));
  it('moves a ring reminder forward in exact four-week intervals',()=>expect(nextMarkerDate({id:'ring',kind:'ring',title:'Remove vaginal ring',date:'2026-09-01',time:'09:00',reminderMinutesBefore:[1440],repeatDays:RING_REPEAT_DAYS,createdAt:1},'2026-10-01')).toBe('2026-10-27'));
});

describe('reminders',()=>{
  it('builds task and marker reminders with exact time and multiple alerts',()=>{const state:FocusToolState={...defaults(),tasks:[{id:'t',title:'Lesson plan',status:'active',priority:'medium',scheduledDate:'2026-09-20',scheduledTime:'10:00',reminderMinutesBefore:60,createdAt:1,updatedAt:1,order:0}],periodTracking:{...tracking,markers:[{id:'m',title:'Remove vaginal ring',date:'2026-09-22',time:'18:30',reminderMinutesBefore:[1440,60],createdAt:1}]}};const items=buildReminders(state,new Date('2026-09-20T08:00:00').getTime());expect(items.some(item=>item.kind==='task')).toBe(true);expect(items.filter(item=>item.kind==='marker')).toHaveLength(2);expect(items.find(item=>item.id.endsWith(':1440'))?.remindAt).toBe(new Date('2026-09-21T18:30:00').getTime())});
  it('marks reminders due inside their active window',()=>{const item={id:'x',kind:'marker' as const,title:'Ring',body:'',remindAt:100,dueAt:200};expect(isReminderDue(item,150)).toBe(true);expect(isReminderDue(item,50)).toBe(false)});
  it('adds a monthly backup reminder until a backup is exported',()=>{const state=defaults(),now=new Date('2026-09-20T12:00:00').getTime();expect(buildReminders(state,now).some(item=>item.kind==='backup')).toBe(true);state.privacy.lastBackupAt=now;expect(buildReminders(state,now).some(item=>item.kind==='backup')).toBe(false)});
});
