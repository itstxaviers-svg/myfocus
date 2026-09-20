import { describe, expect, it } from 'vitest';
import type { AttendanceLedger, Child } from '../types';
import { attendanceRate, childAttendance, lessonDatesForMonth, toggleAttendancePresence } from './attendance';

const child:Child={id:'c1',name:'Mia',createdAt:0,payments:[]};
describe('attendance',()=>{
  it('builds every Monday and Wednesday in September 2026',()=>expect(lessonDatesForMonth('2026-09',[1,3])).toEqual(['2026-09-02','2026-09-07','2026-09-09','2026-09-14','2026-09-16','2026-09-21','2026-09-23','2026-09-28','2026-09-30']));
  it('calculates child attendance and missed dates',()=>{const ledger:AttendanceLedger={g1:{'2026-09-02':['c1'],'2026-09-07':[]}};const result=childAttendance(ledger,'g1',child,['2026-09-02','2026-09-07']);expect(result.attended).toEqual(['2026-09-02']);expect(result.missed).toEqual(['2026-09-07']);expect(result.rate).toBe(50)});
  it('calculates the whole group rate',()=>{const second={...child,id:'c2'};const ledger:AttendanceLedger={g1:{'2026-09-02':['c1','c2'],'2026-09-07':['c1']}};expect(attendanceRate(ledger,'g1',[child,second],['2026-09-02','2026-09-07'])).toBe(75)});
  it('preserves every rapid sequential attendance change',()=>{let ledger:AttendanceLedger={};ledger=toggleAttendancePresence(ledger,'g1','2026-09-02','c1');ledger=toggleAttendancePresence(ledger,'g1','2026-09-07','c1');ledger=toggleAttendancePresence(ledger,'g1','2026-09-02','c2');expect(ledger.g1['2026-09-02']).toEqual(['c1','c2']);expect(ledger.g1['2026-09-07']).toEqual(['c1'])});
});
